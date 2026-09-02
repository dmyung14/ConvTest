import type { Asset } from "@/domain/schema";

/**
 * ILLUSTRATIVE FIXTURE — deterministic demonstration data.
 *
 * Nothing here is a real drug, target, study, institution, trial or publication.
 * Sources are synthetic records inside a demonstration corpus: there are no
 * PubMed identifiers, DOIs, registry numbers, company names or quotations,
 * because inventing any of those would be scientific misinformation dressed as
 * a demo. Every evidence item carries `isIllustrative: true`, and the UI never
 * renders a source as verified unless an adapter actually retrieved it.
 *
 * The asset is designed so the workflow has something real to chew on: strong
 * biology, a genuine contradiction in the preclinical package, no human data,
 * and an operational risk that a scientist would notice before an investor does.
 */
export const demoAsset: Asset = {
  id: "demo-asset",
  name: "DTX-101 (illustrative)",
  indication: "Illustrative monogenic neuromuscular disorder",
  modality: "AAV gene replacement therapy",
  developmentStage: "Preclinical / diligence candidate",
  ownerStatus:
    "Illustrative academic spin-out; programme paused after Series A bridge, IP notionally available",
  updatedAt: "2026-09-01T14:20:00Z",
  isIllustrative: true,

  recommendation: {
    status: "expert_review",
    label: "Escalate to expert review",
    rationale:
      "The biological rationale is well evidenced and the manufacturing route is unremarkable, but the efficacy case rests on one inference chain, the preclinical package contains an unresolved contradiction about durability, and there is no human exposure data at all. None of those are resolvable by reading more of the same corpus — they need three named specialists. Escalation is the honest next step; a go/no-go call now would be a guess wearing a percentage.",
    coveragePercent: 61,
    confidenceLabel: "Moderate confidence in the recommendation, low confidence in the asset",
    confidenceExplanation:
      "Confidence here describes the evidence bundle, not the drug. We are reasonably confident this is the right bundle to escalate (coverage is even across domains and the gaps are explicit). We are not confident the asset works: two of the three claims that drive the thesis are model inferences, and the only durability data conflict with each other.",
  },

  claims: [
    // ---------------------------------------------------------------- biology
    {
      id: "clm-bio-01",
      domain: "biological_rationale",
      text: "Loss of function in the target gene is causal for the illustrative disorder in humans, not merely associated with it.",
      classification: "direct_support",
      confidence: "high",
      confidenceRationale:
        "Two independent synthetic records in the corpus report the same segregation pattern across unrelated pedigrees, and a third reports a dose-dependent relationship between residual protein and age of onset. Human genetic causality is the best-evidenced part of this asset.",
      decisionRelevance:
        "If causality were only associational, gene replacement would be the wrong modality and the rest of the diligence would be moot.",
      reviewStatus: "unreviewed",
      reviewerType: "Human geneticist",
      evidence: [
        {
          id: "ev-bio-01a",
          title: "Illustrative pedigree segregation summary, 41 synthetic families",
          sourceType: "Normalized corpus record",
          publisher: "DecisionTrace demonstration corpus",
          publishedAt: "2024-03-12",
          summary:
            "Synthetic record describing complete segregation of biallelic loss-of-function variants with the disorder phenotype across 41 illustrative families, with no unaffected homozygotes reported.",
          relationship: "supports",
          isIllustrative: true,
        },
        {
          id: "ev-bio-01b",
          title: "Illustrative genotype–onset correlation dataset",
          sourceType: "Normalized corpus record",
          publisher: "DecisionTrace demonstration corpus",
          publishedAt: "2025-01-28",
          summary:
            "Synthetic dataset in which residual protein level explains most of the variance in age of onset — the dose–response pattern usually taken as evidence of causality rather than linkage.",
          relationship: "supports",
          isIllustrative: true,
        },
      ],
    },
    {
      id: "clm-bio-02",
      domain: "biological_rationale",
      text: "Restoring roughly 30% of wild-type protein is sufficient to arrest functional decline.",
      classification: "model_inference",
      confidence: "medium",
      confidenceRationale:
        "No record in the corpus states a threshold. The 30% figure is a model inference from the carrier phenotype in the illustrative genotype–onset dataset: heterozygous carriers are described as unaffected, so approximately half-normal expression is evidently enough. The inference then assumes the threshold sits materially below 50% — which the data do not show, because nothing in the corpus observes anyone between the two states.",
      decisionRelevance:
        "This number sets the required transduction efficiency, and therefore the dose, and therefore most of the safety and manufacturing burden. It is the single most load-bearing assumption in the asset.",
      reviewStatus: "unreviewed",
      reviewerType: "Translational biologist",
      evidence: [
        {
          id: "ev-bio-02a",
          title: "Illustrative carrier phenotype extract",
          sourceType: "Normalized corpus record",
          publisher: "DecisionTrace demonstration corpus",
          publishedAt: "2025-01-28",
          summary:
            "Heterozygous carriers in the synthetic cohort are described as clinically unaffected into the eighth decade, establishing that ~50% expression suffices. The corpus contains no observation below that level.",
          relationship: "context",
          isIllustrative: true,
        },
      ],
    },
    {
      id: "clm-bio-03",
      domain: "biological_rationale",
      text: "The target is expressed in the cell populations the vector actually reaches after systemic administration.",
      classification: "direct_support",
      confidence: "medium",
      confidenceRationale:
        "One synthetic expression atlas record covers the relevant tissue and agrees with the vector biodistribution record. A single source, but a direct one, and the two independent records are consistent.",
      decisionRelevance:
        "Delivering a correct transgene to the wrong compartment is the most common quiet failure in this modality.",
      reviewStatus: "unreviewed",
      reviewerType: "Gene therapy scientist",
      evidence: [
        {
          id: "ev-bio-03a",
          title: "Illustrative tissue expression atlas extract",
          sourceType: "Normalized corpus record",
          publisher: "DecisionTrace demonstration corpus",
          publishedAt: "2023-11-04",
          summary:
            "Synthetic atlas record showing target expression concentrated in the affected cell population, with low expression elsewhere.",
          relationship: "supports",
          isIllustrative: true,
        },
      ],
    },

    // ------------------------------------------------- translational / preclinical
    {
      id: "clm-pre-01",
      domain: "translational_preclinical",
      text: "A single systemic dose produces durable transgene expression for at least 12 months in the disease model.",
      classification: "contradiction",
      confidence: "low",
      confidenceRationale:
        "Two synthetic studies in the corpus disagree. The originating group reports sustained expression at 12 months; an independent replication reports a decline to near-baseline between months 6 and 9 in the same model. The corpus offers no methodological reconciliation, and the two used different assays — which is itself the most likely explanation and the first thing a specialist should test.",
      decisionRelevance:
        "Durability decides whether this is a one-time therapy or a redosing problem. Because AAV redosing is constrained by immunity, a durability failure is closer to a programme failure than a dosing adjustment.",
      reviewStatus: "unreviewed",
      reviewerType: "Gene therapy scientist",
      evidence: [
        {
          id: "ev-pre-01a",
          title: "Illustrative 12-month durability study (originating group)",
          sourceType: "Normalized corpus record",
          publisher: "DecisionTrace demonstration corpus",
          publishedAt: "2024-06-19",
          summary:
            "Synthetic study reporting transgene expression maintained at ~68% of peak at 12 months post-dose, measured by tissue immunostaining.",
          relationship: "supports",
          isIllustrative: true,
        },
        {
          id: "ev-pre-01b",
          title: "Illustrative independent replication, same model",
          sourceType: "Normalized corpus record",
          publisher: "DecisionTrace demonstration corpus",
          publishedAt: "2025-05-02",
          summary:
            "Synthetic replication in which expression declines to near-baseline between months 6 and 9, measured by transcript quantification rather than immunostaining. No overlap in assay method with the originating study.",
          relationship: "weakens",
          isIllustrative: true,
        },
      ],
    },
    {
      id: "clm-pre-02",
      domain: "translational_preclinical",
      text: "Functional benefit in the animal model translates to a clinically meaningful endpoint in humans.",
      classification: "model_inference",
      confidence: "low",
      confidenceRationale:
        "The corpus records a motor-function improvement in the model. The step from that readout to a patient-relevant endpoint is entirely model-generated: no record in the bundle establishes that this animal measure predicts the human endpoint, and for this illustrative disorder the corpus contains no validated translational biomarker at all.",
      decisionRelevance:
        "This inference is what converts a preclinical result into an investment thesis. If it fails, the asset is a good biology story with no path to a registrational endpoint.",
      reviewStatus: "unreviewed",
      reviewerType: "Clinical development lead",
      evidence: [
        {
          id: "ev-pre-02a",
          title: "Illustrative motor-function outcome summary",
          sourceType: "Normalized corpus record",
          publisher: "DecisionTrace demonstration corpus",
          publishedAt: "2024-06-19",
          summary:
            "Synthetic record of a statistically significant improvement in a composite motor score in treated animals versus vehicle at 6 months.",
          relationship: "supports",
          isIllustrative: true,
        },
        {
          id: "ev-pre-02b",
          title: "Illustrative endpoint-translation note",
          sourceType: "Normalized corpus record",
          publisher: "DecisionTrace demonstration corpus",
          publishedAt: "2025-02-11",
          summary:
            "Synthetic methodological note observing that the composite motor score used in the model has no established mapping to the functional scales used in human studies of this illustrative disorder.",
          relationship: "weakens",
          isIllustrative: true,
        },
      ],
    },
    {
      id: "clm-pre-03",
      domain: "translational_preclinical",
      text: "Efficacy has been reproduced in a second, independent disease model.",
      classification: "missing_evidence",
      confidence: "low",
      confidenceRationale:
        "Nothing in the corpus addresses a second model. This is recorded as an explicit gap rather than as a weak positive, because absence of a replication is materially different from a failed replication and the two should never be shown the same way.",
      decisionRelevance:
        "Single-model efficacy plus a contradicted durability result is the pattern that most often collapses at the IND-enabling stage.",
      reviewStatus: "unreviewed",
      reviewerType: "Translational biologist",
      evidence: [],
    },

    // ------------------------------------------------------------ clinical
    {
      id: "clm-clin-01",
      domain: "clinical_evidence",
      text: "The asset has been administered to human subjects.",
      classification: "missing_evidence",
      confidence: "high",
      confidenceRationale:
        "High confidence in the absence, not in the asset: the corpus contains no record of human exposure, and the development-history records are consistent with a programme paused before IND-enabling work completed. Confident that there is nothing here to find.",
      decisionRelevance:
        "Sets the entire risk profile. Every safety and efficacy claim below is therefore extrapolation, and the diligence should be priced that way.",
      reviewStatus: "unreviewed",
      reviewerType: "Clinical development lead",
      evidence: [],
    },
    {
      id: "clm-clin-02",
      domain: "clinical_evidence",
      text: "A patient population large enough to power a registrational study is identifiable and reachable.",
      classification: "model_inference",
      confidence: "medium",
      confidenceRationale:
        "Inferred by combining a synthetic prevalence estimate with a synthetic diagnostic-rate record. Both inputs are single sources, and the inference assumes diagnosed patients are reachable through referral networks — an assumption the corpus does not test, and one that fails routinely in rare disease.",
      decisionRelevance:
        "Determines whether a trial is executable at all, and drives the enrolment timeline that dominates the value model.",
      reviewStatus: "unreviewed",
      reviewerType: "Clinical operations lead",
      evidence: [
        {
          id: "ev-clin-02a",
          title: "Illustrative prevalence estimate",
          sourceType: "Normalized corpus record",
          publisher: "DecisionTrace demonstration corpus",
          publishedAt: "2024-09-30",
          summary:
            "Synthetic epidemiological estimate for the illustrative disorder, with a wide confidence interval reflecting under-ascertainment.",
          relationship: "context",
          isIllustrative: true,
        },
        {
          id: "ev-clin-02b",
          title: "Illustrative diagnostic-rate record",
          sourceType: "Normalized corpus record",
          publisher: "DecisionTrace demonstration corpus",
          publishedAt: "2025-04-08",
          summary:
            "Synthetic record indicating that a minority of the estimated prevalent population carries a confirmed genetic diagnosis, concentrated at a small number of referral centres.",
          relationship: "context",
          isIllustrative: true,
        },
      ],
    },
    {
      id: "clm-clin-03",
      domain: "clinical_evidence",
      text: "A regulatory precedent exists for the proposed accelerated-approval endpoint in this modality.",
      classification: "direct_support",
      confidence: "medium",
      confidenceRationale:
        "One synthetic regulatory-guidance record in the corpus describes a comparable endpoint being accepted for a related modality. Directly sourced, but precedent is not permission, and the record predates the current proposal by two years.",
      decisionRelevance:
        "Changes the shape and cost of the development plan more than almost any scientific parameter.",
      reviewStatus: "unreviewed",
      reviewerType: "Regulatory affairs specialist",
      evidence: [
        {
          id: "ev-clin-03a",
          title: "Illustrative regulatory guidance extract",
          sourceType: "Normalized corpus record",
          publisher: "DecisionTrace demonstration corpus",
          publishedAt: "2023-07-21",
          summary:
            "Synthetic guidance extract describing conditions under which a biomarker-based endpoint was considered reasonably likely to predict clinical benefit for a related gene-therapy modality.",
          relationship: "supports",
          isIllustrative: true,
        },
      ],
    },

    // -------------------------------------------------------------- safety
    {
      id: "clm-saf-01",
      domain: "safety_tolerability",
      text: "No dose-limiting hepatotoxicity was observed at the proposed therapeutic dose in the model.",
      classification: "direct_support",
      confidence: "medium",
      confidenceRationale:
        "A synthetic toxicology record reports clean liver enzymes through the observation window. Directly sourced and unambiguous — but the observation window is 90 days, and systemic AAV hepatotoxicity in humans is not reliably predicted by a 90-day rodent window.",
      decisionRelevance:
        "Hepatotoxicity is the most common cause of clinical hold in systemic AAV programmes.",
      reviewStatus: "unreviewed",
      reviewerType: "Toxicologist",
      evidence: [
        {
          id: "ev-saf-01a",
          title: "Illustrative 90-day toxicology summary",
          sourceType: "Normalized corpus record",
          publisher: "DecisionTrace demonstration corpus",
          publishedAt: "2024-08-14",
          summary:
            "Synthetic toxicology record: no elevation of liver enzymes above vehicle control at the proposed therapeutic dose through day 90; histopathology unremarkable.",
          relationship: "supports",
          isIllustrative: true,
        },
        {
          id: "ev-saf-01b",
          title: "Illustrative observation-window note",
          sourceType: "Normalized corpus record",
          publisher: "DecisionTrace demonstration corpus",
          publishedAt: "2024-08-14",
          summary:
            "Synthetic note recording that the study terminated at day 90 and no longer-term hepatic follow-up was performed.",
          relationship: "context",
          isIllustrative: true,
        },
      ],
    },
    {
      id: "clm-saf-02",
      domain: "safety_tolerability",
      text: "Pre-existing anti-capsid immunity will not exclude a majority of the eligible population.",
      classification: "contradiction",
      confidence: "low",
      confidenceRationale:
        "Two synthetic seroprevalence records in the corpus report substantially different exclusion rates for the same capsid — one below a third, one above a half. They used different assay thresholds, which is the standard reason such figures diverge, and the corpus records no harmonisation.",
      decisionRelevance:
        "Directly multiplies the addressable population and the screen-failure rate. At the higher figure, the enrolment plan in the development history is not achievable.",
      reviewStatus: "unreviewed",
      reviewerType: "Immunologist",
      evidence: [
        {
          id: "ev-saf-02a",
          title: "Illustrative seroprevalence survey A",
          sourceType: "Normalized corpus record",
          publisher: "DecisionTrace demonstration corpus",
          publishedAt: "2023-05-16",
          summary:
            "Synthetic survey reporting neutralising-antibody positivity below one third of the sampled adult population, using a permissive assay threshold.",
          relationship: "supports",
          isIllustrative: true,
        },
        {
          id: "ev-saf-02b",
          title: "Illustrative seroprevalence survey B",
          sourceType: "Normalized corpus record",
          publisher: "DecisionTrace demonstration corpus",
          publishedAt: "2025-06-30",
          summary:
            "Synthetic survey reporting positivity above one half in a comparable population, using a stricter cut-off. Directly inconsistent with survey A at the population level.",
          relationship: "weakens",
          isIllustrative: true,
        },
      ],
    },
    {
      id: "clm-saf-03",
      domain: "safety_tolerability",
      text: "Transgene overexpression in off-target tissue does not produce a functional deficit.",
      classification: "model_inference",
      confidence: "medium",
      confidenceRationale:
        "Inferred from the biodistribution record showing low off-target transduction, combined with the absence of an observed phenotype in the toxicology study. The inference is that low exposure implies tolerable exposure — reasonable, and not the same as having measured off-target function.",
      decisionRelevance:
        "An off-target functional deficit found later is an expensive finding, because it typically requires a capsid or promoter change rather than a dose change.",
      reviewStatus: "unreviewed",
      reviewerType: "Toxicologist",
      evidence: [
        {
          id: "ev-saf-03a",
          title: "Illustrative biodistribution summary",
          sourceType: "Normalized corpus record",
          publisher: "DecisionTrace demonstration corpus",
          publishedAt: "2024-08-14",
          summary:
            "Synthetic biodistribution record showing vector genome copies in off-target tissue an order of magnitude below the target compartment.",
          relationship: "context",
          isIllustrative: true,
        },
      ],
    },

    // ------------------------------------------------ development / operational
    {
      id: "clm-ops-01",
      domain: "development_operational",
      text: "The manufacturing process can reach clinical-grade yield without a process change.",
      classification: "direct_support",
      confidence: "medium",
      confidenceRationale:
        "A synthetic CMC record reports a suspension process meeting the stated yield at pilot scale. Directly sourced. Pilot scale is not commercial scale, and the record does not describe a comparability exercise.",
      decisionRelevance:
        "A late process change forces a comparability bridge, which is one of the most common causes of multi-quarter delay in this modality.",
      reviewStatus: "unreviewed",
      reviewerType: "CMC lead",
      evidence: [
        {
          id: "ev-ops-01a",
          title: "Illustrative pilot-scale CMC summary",
          sourceType: "Normalized corpus record",
          publisher: "DecisionTrace demonstration corpus",
          publishedAt: "2025-03-27",
          summary:
            "Synthetic CMC record describing a suspension-based process meeting target yield and purity specifications at pilot scale across three consecutive runs.",
          relationship: "supports",
          isIllustrative: true,
        },
      ],
    },
    {
      id: "clm-ops-02",
      domain: "development_operational",
      text: "The programme was paused for financing reasons rather than for an undisclosed scientific or safety finding.",
      classification: "direct_support",
      confidence: "low",
      confidenceRationale:
        "One synthetic development-history record attributes the pause to a financing gap. It is a single self-reported source with an obvious incentive, and the corpus contains no independent corroboration. Directly sourced but weakly evidenced — a case where classification and confidence deliberately point in different directions.",
      decisionRelevance:
        "This is the question that decides whether the asset is mispriced or correctly priced. A stranded asset is an opportunity; a quietly failed one is a liability.",
      reviewStatus: "unreviewed",
      reviewerType: "Business development lead",
      evidence: [
        {
          id: "ev-ops-02a",
          title: "Illustrative development-history record",
          sourceType: "Normalized corpus record",
          publisher: "DecisionTrace demonstration corpus",
          publishedAt: "2025-08-05",
          summary:
            "Synthetic record stating that IND-enabling activities were suspended when a bridge financing did not close, and that no safety signal prompted the decision.",
          relationship: "supports",
          isIllustrative: true,
        },
      ],
    },
  ],

  unknowns: [
    {
      id: "unk-01",
      question:
        "Does transgene expression persist beyond 9 months, and does the assay method explain the conflicting durability results?",
      impact: "high",
      rationale:
        "The two durability studies in the corpus disagree and used different assays. If the independent replication is right, a single dose does not hold — and because AAV redosing is constrained by anti-capsid immunity, that is closer to a programme failure than a dosing change. Resolving it is mostly a methods question, which makes it cheap to resolve and expensive to ignore.",
      requiredReviewer: "Gene therapy scientist",
      linkedClaimIds: ["clm-pre-01", "clm-bio-02"],
    },
    {
      id: "unk-02",
      question:
        "What proportion of the eligible population is excluded by pre-existing anti-capsid immunity under a harmonised assay?",
      impact: "high",
      rationale:
        "The seroprevalence figures differ by more than twenty points because the assay thresholds differ. At the higher figure the enrolment plan is not executable at the referral centres where diagnosed patients actually are, which invalidates the trial timeline the value model depends on.",
      requiredReviewer: "Immunologist",
      linkedClaimIds: ["clm-saf-02", "clm-clin-02"],
    },
    {
      id: "unk-03",
      question:
        "Is there any validated translational biomarker linking the animal motor readout to a human functional endpoint?",
      impact: "high",
      rationale:
        "The entire efficacy thesis rests on one model inference with no supporting record. Without a biomarker, the first human study cannot be sized or interpreted, and the accelerated-approval route implied by the regulatory precedent claim is unavailable.",
      requiredReviewer: "Clinical development lead",
      linkedClaimIds: ["clm-pre-02", "clm-clin-03"],
    },
    {
      id: "unk-04",
      question:
        "What residual protein level is actually sufficient to arrest decline, given carriers only bound the answer from above?",
      impact: "medium",
      rationale:
        "The 30% threshold is inferred from an unaffected-carrier phenotype, which shows only that 50% is enough. If the true threshold is higher than assumed, required dose rises, and dose is what drives hepatotoxicity risk and cost of goods together.",
      requiredReviewer: "Translational biologist",
      linkedClaimIds: ["clm-bio-02", "clm-saf-01"],
    },
    {
      id: "unk-05",
      question:
        "Is the financing-gap explanation for the pause corroborated by any source not authored by the originating group?",
      impact: "medium",
      rationale:
        "The single record asserting a financing-driven pause is self-reported. Independent corroboration would move this asset from speculative to genuinely stranded, which is the difference between a mispriced opportunity and someone else's discarded risk.",
      requiredReviewer: "Business development lead",
      linkedClaimIds: ["clm-ops-02"],
    },
  ],

  auditEvents: [
    {
      id: "aud-01",
      actor: "Evidence ingestion agent",
      actorType: "agent",
      action: "Ingested evidence bundle",
      rationale:
        "Retrieved 18 illustrative records across five diligence domains and normalized them to the DecisionTrace evidence schema.",
      timestamp: "2026-08-30T09:12:00Z",
    },
    {
      id: "aud-02",
      actor: "Claim extraction agent",
      actorType: "agent",
      action: "Extracted 14 claims",
      rationale:
        "Decomposed the bundle into atomic, individually checkable claims so that each one can be reviewed without accepting the memo as a whole.",
      timestamp: "2026-08-30T09:26:00Z",
    },
    {
      id: "aud-03",
      actor: "Evidence classification agent",
      actorType: "agent",
      action: "Classified claims by evidence type",
      rationale:
        "Separated sourced facts from model inferences, flagged 2 contradictions and recorded 2 claims as missing evidence rather than inferring a value for them.",
      timestamp: "2026-08-30T09:41:00Z",
    },
    {
      id: "aud-04",
      actor: "DecisionTrace",
      actorType: "system",
      action: "Computed evidence coverage",
      rationale:
        "Applied the documented coverage weights to 14 claims, yielding 61% coverage. Coverage describes evidence completeness only and is not a probability of success.",
      timestamp: "2026-08-30T09:42:00Z",
    },
    {
      id: "aud-05",
      actor: "DecisionTrace",
      actorType: "system",
      action: "Set provisional recommendation: escalate to expert review",
      rationale:
        "Three high-impact unknowns remain open and no claim in the clinical domain carries direct human evidence, so no go/no-go call is defensible from this bundle alone.",
      timestamp: "2026-08-30T09:43:00Z",
    },
    {
      id: "aud-06",
      actor: "R. Okafor, diligence lead",
      actorType: "human",
      action: "Opened review session",
      rationale:
        "Starting with the two contradictions, since they are the cheapest unknowns to resolve and both feed the enrolment model.",
      timestamp: "2026-09-01T13:58:00Z",
    },
    {
      id: "aud-07",
      actor: "R. Okafor, diligence lead",
      actorType: "human",
      action: "Flagged durability contradiction for assay reconciliation",
      rationale:
        "Immunostaining and transcript quantification are not interchangeable readouts here. Requested that the gene therapy reviewer compare methods before either result is treated as decisive.",
      timestamp: "2026-09-01T14:20:00Z",
      claimId: "clm-pre-01",
    },
  ],
};
