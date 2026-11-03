"""Trace a synthetic delivered data batch through training receipts. No dependencies.
Run: python3 labs/audit_lab.py --out labs/runs/audit-your-run
This generates a fixture, not a report about a real training job.
"""
import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path


def jsonl(path, rows):
    path.write_text(''.join(json.dumps(x, ensure_ascii=False, sort_keys=True)+'\n' for x in rows))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', type=Path, required=True)
    output = parser.parse_args().out
    output.mkdir(parents=True, exist_ok=False)
    delivered = [f'new-{i:03}' for i in range(1, 6)]
    manifest = [dict(sample_id=s, dataset_version='construction-v3',
                     drive_id='drive-'+s, split='train') for s in delivered[1:]]
    # Include ordinary data; the first new sample was never registered.
    manifest += [dict(sample_id='base-001', dataset_version='construction-v3',
                      drive_id='base-drive', split='train')]
    jsonl(output/'manifest.jsonl', manifest)
    digest = hashlib.sha256((output/'manifest.jsonl').read_bytes()).hexdigest()
    filters = [dict(sample_id=s, accepted=s!='new-002',
                    reason='missing_frames' if s=='new-002' else 'ok')
               for s in [x['sample_id'] for x in manifest]]
    jsonl(output/'filter-receipts.jsonl',filters)
    # Each row is a real schema example filled with deliberately synthetic events.
    # new-003 is sampled 3 times but every target is masked; new-004 is never sampled.
    assignments = [['new-003','new-005'],['new-003','base-001'],
                   ['new-005','base-001'],['new-003','new-005'],['new-005','base-001']]
    events=[]
    for step,ids in enumerate(assignments,1):
        for sample in ids:
            valid_steps=0 if sample=='new-003' else 6
            events.append(dict(run_id='synthetic-audit', manifest_sha256=digest,
                               rank=0, optimizer_update=step, batch_sample_id=sample,
                               decoded=True, valid_target_steps=valid_steps,
                               loss_connected=True, update_applied=True))
    jsonl(output/'training-events.jsonl',events)
    manifest_ids={x['sample_id'] for x in manifest}
    accepted={x['sample_id'] for x in filters if x['accepted']}
    assert len(manifest_ids)==len(manifest), 'duplicate manifest IDs'
    assert all(x['batch_sample_id'] in accepted for x in events)
    assert all(x['manifest_sha256']==digest for x in events)
    appearances=Counter(x['batch_sample_id'] for x in events)
    summary=[]
    for sample in delivered:
        rows=[x for x in events if x['batch_sample_id']==sample]
        n_valid=sum(x['valid_target_steps'] for x in rows)
        eligible_updates={x['optimizer_update'] for x in rows
                          if x['valid_target_steps']>0 and x['loss_connected'] and x['update_applied']}
        if sample not in manifest_ids: diagnosis='未进入训练清单'
        elif sample not in accepted: diagnosis='被质量过滤拒绝'
        elif not appearances[sample]: diagnosis='本次预算内未采到'
        elif not n_valid: diagnosis='被采到但监督全部被 mask'
        else: diagnosis='有有效监督且所属 batch 已更新；收益仍需消融与独立评测'
        summary.append(dict(sample_id=sample, in_manifest=sample in manifest_ids,
                            accepted=sample in accepted, draw_count=appearances[sample],
                            valid_target_steps=n_valid, eligible_update_count=len(eligible_updates),
                            diagnosis=diagnosis))
    results=dict(provenance='synthetic teaching fixture; not a real model run',
                 manifest_sha256=digest, delivered_count=len(delivered),
                 in_manifest_count=sum(x['in_manifest'] for x in summary),
                 accepted_count=sum(x['accepted'] for x in summary),
                 sampled_unique_count=sum(x['draw_count']>0 for x in summary),
                 valid_supervision_unique_count=sum(x['valid_target_steps']>0 for x in summary),
                 samples=summary)
    (output/'audit-results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(results,ensure_ascii=False,indent=2))

if __name__=='__main__':
    main()
