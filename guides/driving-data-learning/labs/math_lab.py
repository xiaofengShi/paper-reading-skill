"""Standard-library teaching calculations; all values are synthetic."""
import json
import math
import random
from pathlib import Path


def main():
    x, y, w, lr = 2.0, 1.0, 0.2, 0.1
    loss = lambda weight: (weight * x - y) ** 2
    grad = 2 * (w * x - y) * x
    eps = 1e-6
    numerical_grad = (loss(w + eps) - loss(w - eps)) / (2 * eps)
    assert math.isclose(grad, numerical_grad, rel_tol=1e-8)
    updated = w - lr * grad
    assert loss(updated) < loss(w)
    p, draws, batch = 0.001, 32000, 32
    target = 0.2
    multiplier = target * (1 - p) / (p * (1 - target))
    # Per-timestep squared Euclidean errors, after summing coordinates.
    errors = [[1, 4, 999], [9, 999, 999]]
    masks = [[1, 1, 0], [1, 0, 0]]
    sums = [sum(e * m for e, m in zip(row, mask)) for row, mask in zip(errors, masks)]
    counts = [sum(mask) for mask in masks]
    global_mean = sum(sums) / sum(counts)
    per_sample_mean = sum(s / n for s, n in zip(sums, counts)) / len(sums)
    assert math.isclose(global_mean, 14 / 3)
    assert math.isclose(per_sample_mean, 5.75)
    # Exact finite mixture: biased sampling and loss weight multiply.
    raw_risk = (1-p) * 1 + p * 9
    oversampled_risk = 0.8 * 1 + 0.2 * 9
    double_weighted_coefficient_mass = 0.2 * 10 / (0.8 * 1 + 0.2 * 10)
    # Deterministic example: data order is randomized at the drive level.
    drives = list(range(12))
    random.Random(7).shuffle(drives)
    train, valid, test = map(set, (drives[:8], drives[8:10], drives[10:]))
    assert not (train & valid or train & test or valid & test)
    results = {
        'one_step': {'x': x, 'y': y, 'weight_before': w, 'prediction_before': w*x,
                     'loss_before': loss(w), 'analytic_gradient': grad,
                     'finite_difference_gradient': numerical_grad, 'learning_rate': lr,
                     'weight_after': updated, 'prediction_after': updated*x,
                     'loss_after': loss(updated)},
        'sampling': {'tail_fraction': p, 'draws': draws,
                     'expected_tail_draws': draws*p,
                     'expected_draws_per_tail_item': draws/1_000_000,
                     'probability_specific_item_unseen': (1-1/1_000_000)**draws,
                     'probability_batch_contains_tail': 1-(1-p)**batch,
                     'weight_multiplier_for_20pct_tail': multiplier,
                     'expected_tail_draws_after_weighting': draws*target},
        'masking': {'global_valid_step_mean': global_mean,
                    'equal_sample_mean': per_sample_mean,
                    'incorrect_fixed_padding_denominator': sum(sums)/6},
        'objectives': {'population_tail_fraction': p, 'population_risk': raw_risk, 'oversampled_risk': oversampled_risk,
                       'tail_mass_if_also_weighted_10x': double_weighted_coefficient_mass},
        'evaluation': {'zero_failures_in_100_upper_95pct': 1-0.05**(1/100),
                       'zero_failures_in_1000_upper_95pct': 1-0.05**(1/1000)},
        'split': {'train_drives': sorted(train), 'validation_drives': sorted(valid),
                  'test_drives': sorted(test)}
    }
    target_path = Path(__file__).with_name('math-results.json')
    target_path.write_text(json.dumps(results, ensure_ascii=False, indent=2)+'\n')
    print(json.dumps(results, ensure_ascii=False, indent=2))

if __name__ == '__main__':
    main()
