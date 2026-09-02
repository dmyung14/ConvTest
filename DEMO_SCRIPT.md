# DecisionTrace — 90-second demonstration script

**Setup before the call:** `npm run dev`, open `http://localhost:3000`, and click **Reset demo** on the workspace if you have clicked through it already. Have the landing page on screen when you start.

---

## The spoken script (~85 seconds at a natural pace)

> Convexia already looks strong at discovering and prioritising overlooked assets, so I didn't try to reproduce that system without understanding your internal stack. Instead I focused on the handoff between agent output and expert judgment. DecisionTrace separates sourced evidence from model inference, exposes contradictions and missing evidence, and directs specialists toward the uncertainties most likely to change a go/no-go decision.

_(Click **Open demonstration asset**.)_

> Here's one illustrative asset — everything in it is synthetic, so nothing here is a real drug or study. The recommendation is "escalate to expert review" at 61% evidence coverage. That number isn't a probability of success; it's how much of the claim set is backed by evidence someone can actually open. And three uncertainties dominate the recommendation, ranked right at the top.

_(Set the evidence-type filter to **Contradiction**. Two of fourteen claims remain.)_

> The summary looks promising, but two claims contradict themselves. Let me open one.

_(Click the durability claim.)_

> Durability decides whether this is a one-time therapy or a redosing problem. When I open the claim I see the conflicting record first, above the supporting one — the originating group reports expression at twelve months, an independent replication reports it collapsing by month nine, and they used different assays. I can see what directly supports the claim, what the model inferred, and what conflicts with it, each labelled differently rather than blended into prose.

_(Click **Needs specialist**, type a short reason, click **Record needs specialist**, then close the drawer.)_

> A domain expert can verify or reject the claim, explain why, and that lands in the audit trail — who decided what, on what evidence, and when. The goal isn't to replace scientific diligence. It's to make AI-assisted diligence easier to inspect, evaluate and trust.

_(Scroll to the unknowns panel.)_

> And the three highest-impact unknowns each name the specialist who can actually close them — a gene therapy scientist, an immunologist, a clinical development lead — rather than sending everything to everyone.

> I built this because the area where I think I can contribute most is evaluation infrastructure: turning agent outputs into defensible decisions, and using expert feedback to improve the system over time.

---

## If you have another 30 seconds

- **Missing evidence is not a weak positive.** Filter to **Missing evidence** and open "The asset has been administered to human subjects." The claim is recorded as a gap that contributes zero to coverage, with an explicit note that no inference was substituted for it.
- **Classification and confidence are independent.** The last claim — that the programme was paused for financing reasons — is directly sourced but low confidence, because the only source is the party with an incentive.
- **The memo prints alone.** Click **Decision memo**: the app is suppressed and a six-section record prints, including the exact coverage formula so a reader can recompute the number instead of trusting it.

## Questions this is meant to open

1. Where does Convexia currently feel the most friction between agent output and expert approval?
2. How are contradictions and missing evidence represented internally today?
3. Is expert disagreement stored as training or evaluation data?
4. Which customer needs the most auditability — pharma BD, biotech investors, scientists, or clinical operators?
5. Would more value come from the review interface, the evaluation dataset, or instrumenting the agents' reasoning paths?

## Things to say plainly if asked

- Every asset, source and number in the demo is synthetic. It demonstrates a workflow, not a scientific finding.
- Coverage is an evidence-completeness measure, not a probability of success.
- This is an independent prototype built from public information only.
