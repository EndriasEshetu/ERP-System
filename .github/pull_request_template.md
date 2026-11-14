## Description
<!-- Provide a brief explanation of the change, motivation, and context. -->

## Type of Change
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] Refactor (code restructuring with no behavior change)
- [ ] Database schema change / migration
- [ ] Documentation update
- [ ] Chore / Infrastructure / Build tool update

## Module(s) Affected
- [ ] Core Platform / Shared
- [ ] Authentication & Sessions
- [ ] Organization & Multi-tenancy
- [ ] Users, Roles & Permissions
- [ ] CRM (Customers, Leads, Opportunities)
- [ ] Sales (Quotations, Orders, Invoicing)
- [ ] Products & Inventory (Kenenisa)
- [ ] Suppliers & Purchasing (Kenenisa)
- [ ] Notifications & Reporting (Kenenisa)

## ERP Architectural & Quality Checklist
- [ ] **Multi-tenancy Scoping**: All queries and mutations are properly scoped by `organizationId`.
- [ ] **Module Boundaries**: No cross-module direct internal database access without agreed shared contracts.
- [ ] **Error & Response Format**: Standardized API response format (`{ success, message, data/errors }`) followed.
- [ ] **Types**: TypeScript strict mode respected; shared types added to `packages/shared` if cross-cutting.
- [ ] **Database Migration**: If schema changed, migration script is tested and backwards compatible.
- [ ] **Verification**: Verified locally with `npm run test` and `npm run lint`.

