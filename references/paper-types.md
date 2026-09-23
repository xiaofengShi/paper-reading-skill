# Paper-type routes for a reading atlas

Choose the paper's dominant contribution before selecting views. Mixed papers can combine routes. The global map and experiment/argument map should expose the paper's actual structure, not fit every paper into the same model-training pipeline.

| Type | Global view | Detail views and reading emphasis |
|---|---|---|
| Empirical ML / systems | Problem → system idea → method → evidence | Training/inference flow, objective and critical modules, dataset/metric/control matrix, compute and protocol boundaries |
| Agent system | User task → agent/environment loop → outcome | Tools, harness, state, feedback, context/token budget, failure modes; keep training and inference paths distinct |
| Benchmark | Constructed task universe → measurement claim | Data creation and filtering flow, annotation/verifier, leakage controls, metric and coverage matrix; model rankings are a use of the benchmark |
| Dataset | Source → selection → transformation → release | Provenance, licensing, deduplication, quality checks, splits, utility experiment at comparable scale |
| Theory | Definitions/assumptions → lemmas → theorem | Proof dependency graph, worked example, boundary cases; experimental evidence categories do not replace proof validity |
| Survey | Central question → taxonomy branches → representative work | Comparison axes, cross-links and uncovered regions; avoid a fake single-method flow |

For an empirical technical report such as MiMo-V2.6, make a compact global training map, then separate mechanism maps for distinctive steps, and an experiment atlas that keeps full-model results distinct from controlled component studies.
