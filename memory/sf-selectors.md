# Salesforce Lightning Selector Library

## Global Navigation
| Element | Playwright Locator |
|---|---|
| App Launcher | `page.locator('[title="App Launcher"]')` |
| Nav Tab | `page.getByRole('link', { name: 'OBJECT_NAME' })` |
| Global Search | `page.getByPlaceholder('Search...')` |

## Action Buttons
| Button | Locator |
|---|---|
| New | `page.getByRole('button', { name: 'New' })` |
| Save | `page.getByRole('button', { name: 'Save' })` |
| Cancel | `page.getByRole('button', { name: 'Cancel' })` |
| Delete | `page.getByRole('button', { name: 'Delete' })` |
| Edit | `page.getByRole('button', { name: 'Edit' })` |

## Feedback & UI State
| Element | Locator |
|---|---|
| Toast message | `page.locator('.toastMessage')` |
| Success toast | `page.locator('.slds-notify--toast .toastMessage')` |
| Error toast | `page.locator('.slds-notify--toast.slds-notify--error .toastMessage')` |
| SF Spinner | `page.locator('.forceListViewManagerSpinner')` |
| Any dialog | `page.getByRole('dialog')` |
| Dialog Save | `page.getByRole('dialog').getByRole('button', { name: 'Save' })` |

## Lead Object
| Field | Locator |
|---|---|
| First Name | `page.getByLabel('First Name')` |
| Last Name | `page.getByLabel('Last Name')` |
| Company | `page.getByLabel('Company')` |
| Email | `page.getByLabel('Email')` |
| Phone | `page.getByLabel('Phone')` |
| Lead Source | `page.getByLabel('Lead Source')` |
| Status | `page.getByLabel('Status')` |
| Rating | `page.getByLabel('Rating')` |
| Title | `page.getByLabel('Title')` |
| Description | `page.getByLabel('Description')` |

## Opportunity Object
| Field | Locator |
|---|---|
| Opportunity Name | `page.getByLabel('Opportunity Name')` |
| Account Name | `page.getByLabel('Account Name')` |
| Close Date | `page.getByLabel('Close Date')` |
| Stage | `page.getByLabel('Stage')` |
| Amount | `page.getByLabel('Amount')` |
| Description | `page.getByLabel('Description')` |

## Contact Object
| Field | Locator |
|---|---|
| First Name | `page.getByLabel('First Name')` |
| Last Name | `page.getByLabel('Last Name')` |
| Account Name | `page.getByLabel('Account Name')` |
| Email | `page.getByLabel('Email')` |
| Phone | `page.getByLabel('Business Phone')` |
| Title | `page.getByLabel('Title')` |

## Account Object
| Field | Locator |
|---|---|
| Account Name | `page.getByLabel('Account Name')` |
| Phone | `page.getByLabel('Phone')` |
| Website | `page.getByLabel('Website')` |
| Industry | `page.getByLabel('Industry')` |
| Type | `page.getByLabel('Type')` |
| Employees | `page.getByLabel('Employees')` |
| Annual Revenue | `page.getByLabel('Annual Revenue')` |
| Billing Street | `page.getByLabel('Billing Street')` |
| Billing City | `page.getByLabel('Billing City')` |
| Billing State | `page.getByLabel('Billing State/Province')` |
| Billing Zip | `page.getByLabel('Billing Zip/Postal Code')` |
| Billing Country | `page.getByLabel('Billing Country')` |
| Description | `page.getByLabel('Description')` |

## Case Object
| Field | Locator |
|---|---|
| Status | `page.getByLabel('Status')` |
| Priority | `page.getByLabel('Priority')` |
| Case Origin | `page.getByLabel('Case Origin')` |
| Subject | `page.getByLabel('Subject')` |
| Account Name | `page.getByLabel('Account Name')` |
| Contact Name | `page.getByLabel('Contact Name')` |
| Description | `page.getByLabel('Description')` |

## Lookup Fields
| Field | Behavior |
|---|---|
| Contact Name | `fillLookup(page, 'Contact Name', 'contact')` |
| Account Name | `fillLookup(page, 'Account Name', 'agentic')` |
| Parent Account | `fillLookup(page, 'Parent Account', 'Acme Corp')` |

## List View
| Element | Locator |
|---|---|
| View switcher button | `page.getByRole('button', { name: /Select a List View/i })` |
| All Leads | `page.getByRole('option', { name: 'All Leads' })` |
| All Opportunities | `page.getByRole('option', { name: 'All Opportunities' })` |
| All Contacts | `page.getByRole('option', { name: 'All Contacts' })` |
| All Accounts | `page.getByRole('option', { name: 'All Accounts' })` |
| All Cases | `page.getByRole('option', { name: 'All Cases' })` |
| Record row link | `page.getByRole('link', { name: 'RECORD_NAME' })` |
