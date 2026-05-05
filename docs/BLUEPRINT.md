# Dealership Commissions + AI Coaching Platform — V1 Blueprint

## Product Identity
This is not just a commission calculator. The key value is AI-powered dealership coaching.

The platform should:
- import monthly performance data
- calculate commissions reliably
- preserve historical results
- allow manager overrides
- give salespeople a clean personal view
- generate meaningful coaching insights from the data

## Core Data Sources
Monthly manual imports:
- Sign Ups
- Deal Log
- Accessories
- Finance
- Aftercare
- Lead Data
- NPS / DAH / Google Reviews

## Key Matching Principle
Deal Number is the master transaction key.

Salesperson name is the staff matching key, with a staff table to handle active/inactive people, cadets, and commission eligibility.

## Calculation Notes Confirmed
- Sign Ups: count by salesperson
- Deal Log: real GP = Processed Gross - AM - Gross
- Accessories: GP per product = Sale Amount - Cost Amount, summed by salesperson/deal
- Finance: penetration = Dealer Finance count / total deals
- Finance IPUR = Total Income / total deals
- Aftercare PPV = Total Aftermarket / total deals
- Commission bonus pool includes:
  - Aftercare PPV
  - Finance %
  - Finance IPUR
  - Accessory
  - Trade In %
  - Google Review
  - NPS
  - DAH

## Core Commission Formula Logic
Base payout:
- Units sold x base unit rate

KPI bonus pool:
- Sum of configured bonus components

Volume accelerator:
- Under 12 units: 0% of bonus pool
- 12 to 14 units: 25% of bonus pool
- 15 to 17 units: 75% of bonus pool
- 18+ units: 100% of bonus pool

Final payout:
- Base unit commission
- plus unlocked KPI bonus pool
- plus manual bonuses
- plus direct purchase bonuses if enabled
- subject to cadet/eligibility rules

## Important Design Principle
Raw imports are never edited directly.

Adjustments are stored separately:
- gross overrides
- excluded deals
- manual bonuses
- manager notes

## Platform Structure
Frontend:
- HTML
- CSS
- Vanilla JavaScript
- GitHub Pages hosting

Backend:
- Supabase Auth
- Supabase Postgres
- optional Supabase Edge Functions later for protected AI calls

AI Layer:
- OpenAI API via secure backend/Edge Function
- AI should consume calculated metrics and trends, not raw messy import tables

## Manager Experience
Manager dashboard should be hybrid:
- summary cards at top
- team table underneath
- click salesperson to drill down
- performance review mode modal
- deal-level view when required
- manual bonuses and overrides

## Salesperson Experience
Salesperson dashboard should be mobile-first:
- previous month commission
- historical performance
- KPI cards
- top 3 focus areas
- commission simulator
- no access to other salespeople

## AI Coaching Layer
The AI layer should generate:
- strengths
- risks
- opportunities
- top 3 focus areas
- PSP review summary
- trend notes over previous month / quarter / year
- manager-friendly coaching language
- salesperson-friendly simplified action plan

## Phase 1 Must Include
- Auth-ready structure
- Staff management-ready database
- Commission period structure
- Import modules
- Header recognition
- Deal merging by Deal Number
- Rules engine
- Manager dashboard
- Salesperson dashboard
- AI coaching prompt framework
- Commission simulator framework

## Not In Scope For Phase 1
- live DMS feeds
- BI automation
- payroll integration
- native mobile app
- real-time feeds
