---
layout: post
title: Estimating Gym COVID Risk
date: "2020-10-22"
author: Jeff Chen
tags: 2020,october,gym,covid
---

In Boise, gyms are open! I visited [Axiom Fitness](https://www.axiomfitness.com/parkcenter) the other morning. The facility was great, but I was pretty uncomfortable with the maskless environment. Below, I estimate my risk of catching COVID from a single gym session, and find that **my risk of catching COVID from a single gym session is ~0.03%**. With ~10 gym sessions remaining in my time in Idaho, my total risk of catching COVID specifically from the gym is `1 - (1 - risk_per_session)^10` = `0.003037839182`, or about **0.3%**. This is well within my personal risk tolerance, so I decided to buy a single-month pass!

This page is interactive: try estimating risk for your own gym sessions!

<!-- excerpt -->

## Assumptions & Constants

- The people I interact with at the gym are independent per session - this likely **over-estimates risk**
- Infected individuals are exactly as likely to be out and about as uninfected individuals. It's unclear to me how this assumption affects our risk calculation:
  - it overestimates because sick people will stay home
  - underestimates because people undergoing risky behaviors are more likely to be infected
- `active_infection_days` = <input type="number" id="active-infection-days" value=30 disabled onchange="calculate()" max=99 min=0 />
  - An infected individual is infectious for <span class="active-infection-days"></span> days, after which they've either recovered or passed away.
- `risky_behavior_multiplier` = <input type="number" id="risky-behavior-multiplier" step=0.1 value=1.5 onchange="calculate()" min=0 max=99 />
  - I assumed that gym-goers are more likely to be infected because they're more likely to conduct risky activities.
- `infected_transmission_risk_min` = <input type="number" disabled id="infected-transmission-risk-min" value=0.001 min=0 max=1000 />
  - [microcovid.org](https://www.microcovid.org/paper/5-activity-risk) calculates transmission risk of a one-hour, indoor, unmasked interaction with someone who has COVID from three feet away to be 6%.
- `gym_6ft_interaction_rate` = <input type="number" id="gym-6ft-interaction-rate" value=0.15 onchange="calculate()" min=0 max=1000 step=0.01 />
  - % of time inside a gym where I am within 6 ft of another person
  - obtained empirically from a gym session, multiplied by 1.5 to conservatively account for missing observations
- `gym_session_duration` = <input type="number" id="gym-session-duration" value=60 onchange="calculate()" min=0 max=999 />
  - How long a gym session lasts, in minutes.

## Variables

- `county_cases_reported` = <input type="number" id="county-cases-reported" value=1686 onchange="calculate()" min=0 max=999999 />
  - cases in the county during the last `active_infection_days` days
  - [In the last 4 weeks of full reporting (9/13 - 10/4), Ada county reported 1686 cases](https://public.tableau.com/profile/central.district.health#!/vizhome/CDHCOVID-19/CDHCOVID-19Information)
- `county_postivity_rate` = <input type="number" id="county-positivity-rate" value=0.07 onchange="calculate()" min=0 max=1000 step=0.01 />
  - test positivity rate over the last `active_infection_days`
- `county_population` = <input type="number" id="county-population" value=502970 onchange="calculate()" min=0 max=99999999 />
  - number of people in the county
  - [Ada county demographics](https://adacounty.id.gov/developmentservices/wp-content/uploads/sites/37/Population-Demographics.pdf)
- `county_true_active_infections` = `county_cases_reported * (16 * (county_positivity_rate ^ 0.5) + 2.5)` = <input type="number" id="county-true-active-infections" disabled value=11352 min=0 max=999999 />
  - [This paper](https://covid19-projections.com/estimating-true-infections/) provides the above formula.
- `gym_goer_infection_probability` = `county_true_active_infections * risky_behavior_multiplier / county_population` = <input type="number" id="gym-goer-infection-probability" disabled value=0.0338 min=0 max=999999 />

## Formula

Finally, we can calculate our risk per session, which is the amount of time spent within 6ft of another person in a single session multiplied by the probability that they are infectious.

`risk_per_session` = `gym_goer_infection_probability * gym_6ft_interaction_rate * gym_session_duration * infected_transmission_risk_min` = <br /> <strong id="risk-per-session">0.0003042</strong> = <strong id="risk-per-session-pct">0.0003042%</strong>.

<script>
function calculate() {
  console.log("calc");
  var activeInfectionDays = document.getElementById("active-infection-days").value;
  var riskyBehaviorMultiplier = document.getElementById("risky-behavior-multiplier").value;
  var infectedTransmissionRiskMin = document.getElementById("infected-transmission-risk-min").value;
  var gym6ftInteractionRate = document.getElementById("gym-6ft-interaction-rate").value;
  var gymSessionDuration = document.getElementById("gym-session-duration").value;
  var countyCasesReported = document.getElementById("county-cases-reported").value;
  var countyPositivityRate = document.getElementById("county-positivity-rate").value;
  var countyPopulation = document.getElementById("county-population").value;

  var countyTrueActiveInfections = Math.round(countyCasesReported * (16 * Math.sqrt(countyPositivityRate) + 2.5));
  var gymGoerInfectionProbability = countyTrueActiveInfections * riskyBehaviorMultiplier / countyPopulation;

  var riskPerSession = gymGoerInfectionProbability * gym6ftInteractionRate * gymSessionDuration * infectedTransmissionRiskMin;

  document.getElementById("county-true-active-infections").value = countyTrueActiveInfections;
  document.getElementById("gym-goer-infection-probability").value = gymGoerInfectionProbability.toFixed(4);
  document.getElementById("risk-per-session").innerText = riskPerSession.toFixed(6);
  document.getElementById("risk-per-session-pct").innerText = (riskPerSession * 100).toFixed(4) + "%";

}

calculate();
</script>
