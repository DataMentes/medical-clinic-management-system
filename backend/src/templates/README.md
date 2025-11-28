# Templates Usage Guide

This folder contains templates for quickly creating new features.

## How to Use Templates

1. **Copy the template file** to the appropriate directory
2. **Rename** following the naming convention
3. **Replace** placeholder text with your actual resource name
4. **Customize** the logic for your specific needs

## Template Files

### service.template.js
**Copy to:** `src/services/[resource].service.js`
**Example:** `src/services/user.service.js`

Template for database operations and business logic.

### controller.template.js
**Copy to:** `src/controllers/[resource].controller.js`
**Example:** `src/controllers/user.controller.js`

Template for HTTP request handlers.

### routes.template.js
**Copy to:** `src/routes/[resource].routes.js`
**Example:** `src/routes/user.routes.js`

Template for API route definitions.

### middleware.template.js
**Copy to:** `src/middlewares/[purpose].middleware.js`
**Example:** `src/middlewares/auth.middleware.js`

Template for custom middleware functions.

## Quick Start Example

To add a "Product" feature:

```bash
# 1. Create files from templates
cp src/templates/service.template.js src/services/product.service.js
cp src/templates/controller.template.js src/controllers/product.controller.js
cp src/templates/routes.template.js src/routes/product.routes.js

# 2. Edit each file and replace:
#    - "resource" → "product"
#    - "Resource" → "Product"

# 3. Add Prisma model in prisma/schema.prisma
# 4. Run: npx prisma migrate dev --name add_product_model
# 5. Register routes in src/app.js:
#    app.use('/api/products', require('./routes/product.routes'));
```

## Search & Replace

When using templates, replace these placeholders:

- `resource` → your resource name (lowercase)
- `Resource` → your resource name (PascalCase)
- `[Resource]` → your actual resource description
- `[Purpose]` → actual middleware purpose

## Example Replacement

**Before:**
```javascript
const resourceService = require('../services/resource.service');
```

**After:**
```javascript
const productService = require('../services/product.service');
```
