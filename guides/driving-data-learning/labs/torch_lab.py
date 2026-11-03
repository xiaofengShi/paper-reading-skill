"""A fixed-update rare-case regression experiment. Synthetic, CPU only.
Run: uv run --no-project --python 3.13 --with torch==2.15.0 --with numpy torch_lab.py --out runs/my-run
The lane-error input is supplied; this does not learn visual perception or driving.
"""
import json
import argparse
import platform
from pathlib import Path
import torch
from torch import nn
from torch.utils.data import DataLoader, TensorDataset, WeightedRandomSampler


def dataset(n, n_tail, seed):
    generator = torch.Generator().manual_seed(seed)
    lateral_error = torch.rand(n, generator=generator) * 2 - 1
    construction = torch.zeros(n)
    construction[:n_tail] = 1
    features = torch.stack([lateral_error, construction], dim=1)
    target = -0.5 * lateral_error + 1.5 * construction
    return TensorDataset(features, target[:, None], construction.bool())


def evaluate(model, data):
    x, y, tail = data.tensors
    model.eval()
    with torch.no_grad():
        error = (model(x) - y).square().squeeze(1)
    return {'normal_mse': error[~tail].mean().item(),
            'tail_mse': error[tail].mean().item(),
            'overall_mse': error.mean().item(),
            'n_normal': int((~tail).sum()), 'n_tail': int(tail.sum())}


def train(mode, training, validation, test, output_dir):
    steps, batch_size = 120, 32
    model = nn.Linear(2, 1)
    with torch.no_grad():
        model.weight.zero_()
        model.bias.zero_()
    x, y, tail = training.tensors
    # 16 / 1024 = 1/64 are rare; r=21 makes rare draw probability 1/4.
    weights = torch.ones(len(training), dtype=torch.double)
    if mode == 'weighted':
        weights[tail] = 21.0
    sampler = WeightedRandomSampler(weights, steps*batch_size, replacement=True,
                                    generator=torch.Generator().manual_seed(7))
    loader = DataLoader(training, batch_size=batch_size, sampler=sampler)
    optimizer = torch.optim.SGD(model.parameters(), lr=0.05)
    initial = {k: v.detach().clone() for k, v in model.state_dict().items()}
    best_score, best_state = float('inf'), None
    seen, unique, history = 0, set(), []
    # IDs are logged separately using an equivalent generator for audit.
    audit_sampler = WeightedRandomSampler(weights, steps*batch_size, replacement=True,
                                          generator=torch.Generator().manual_seed(7))
    for index in audit_sampler:
        unique.add(index)
    model.train()
    for step, (obs, target, is_tail) in enumerate(loader, start=1):
        seen += int(is_tail.sum())
        optimizer.zero_grad(set_to_none=True)
        prediction = model(obs)
        loss = nn.functional.mse_loss(prediction, target)
        assert torch.isfinite(loss)
        loss.backward()
        assert all(p.grad is not None and torch.isfinite(p.grad).all()
                   for p in model.parameters())
        optimizer.step()
        if step % 20 == 0:
            metrics = evaluate(model, validation)
            # Predeclared balanced validation objective; test is not used here.
            score = 0.5 * (metrics['normal_mse'] + metrics['tail_mse'])
            history.append({'update': step, 'validation_balanced_mse': score})
            if score < best_score:
                best_score = score
                best_state = {k: v.detach().clone() for k,v in model.state_dict().items()}
            model.train()
    assert best_state is not None
    model.load_state_dict(best_state)
    result = {'mode': mode, 'updates': steps, 'sample_draws': steps*batch_size,
              'unique_training_items': len(unique), 'tail_draws': seen,
              'normal_draws': steps*batch_size-seen,
              'selected_update': min(history,key=lambda h:h['validation_balanced_mse'])['update'],
              'test': evaluate(model,test), 'validation_history':history,
              'learned_weight':model.weight.detach().tolist(),
              'learned_bias':model.bias.detach().tolist()}
    # Reload consistency, using a distinct file for each run.
    path=output_dir / f'{mode}-checkpoint.pt'
    assert not path.exists(), f'Refusing to overwrite {path}'
    torch.save({'model_state_dict': best_state, 'feature_order':['lateral_error','construction'],
                'units':'synthetic normalized lateral action', 'selected_update':result['selected_update']},path)
    restored=nn.Linear(2,1)
    restored.load_state_dict(torch.load(path,weights_only=True)['model_state_dict'])
    with torch.no_grad():
        assert torch.equal(model(test.tensors[0]),restored(test.tensors[0]))
    return result


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', type=Path, required=True, help='New output directory; existing paths are refused')
    args=parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=False)
    torch.set_num_threads(1)
    torch.use_deterministic_algorithms(True)
    torch.manual_seed(7)
    training=dataset(1024,16,11)
    validation=dataset(400,200,22)
    test=dataset(400,200,33)
    results={'environment':{'python':platform.python_version(),'torch':torch.__version__,
                            'device':'cpu','seed':7},
             'data':'independent synthetic draws from a known linear rule; no real driving data',
             'training_n':1024,'training_tail_n':16,
             'validation_n':400,'test_n':400,
             'runs':[train(mode,training,validation,test,args.out) for mode in ['uniform','weighted']]}
    (args.out/'torch-results.json').write_text(json.dumps(results,indent=2)+'\n')
    print(json.dumps(results,indent=2))

if __name__=='__main__':
    main()
