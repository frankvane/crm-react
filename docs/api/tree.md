crm-server
├──  --date=short --reverse
├── README.md
├── UPDATE.md
├── app.js
├── config
│   ├── auth.js
│   ├── config.json
│   └── database.js
├── controllers
│   ├── auth.controller.js
│   ├── category.controller.js
│   ├── categoryType.controller.js
│   ├── resource.controller.js
│   ├── resourceAction.controller.js
│   ├── role.controller.js
│   └── user.controller.js
├── data.json
├── docs
│   ├── auth.md
│   ├── category.md
│   ├── resource.md
│   ├── role.md
│   ├── tree.md
│   └── user.md
├── middlewares
│   ├── auth.js
│   ├── errorHandler.js
│   ├── index.js
│   └── rbac.js
├── migrations
│   ├── 20240318000000-create-user.js
│   ├── 20240318000001-create-resource.js
│   ├── 20240318000001-create-role.js
│   ├── 20240318000002-create-permission.js
│   ├── 20240318000003-create-role-permission.js
│   ├── 20240318000004-create-user-role.js
│   └── 20240318000005-create-role-resource.js
├── models
│   ├── category.model.js
│   ├── categoryType.model.js
│   ├── index.js
│   ├── permission.model.js
│   ├── refreshToken.model.js
│   ├── resource.model.js
│   ├── resourceAction.model.js
│   ├── role.model.js
│   ├── roleResource.model.js
│   ├── tokenBlacklist.model.js
│   └── user.model.js
├── package-lock.json
├── package.json
├── routes
│   ├── auth.routes.js
│   ├── category.routes.js
│   ├── categoryType.routes.js
│   ├── index.js
│   ├── resource.routes.js
│   ├── resourceAction.routes.js
│   ├── role.routes.js
│   └── user.routes.js
├── seeders
│   └── init.js
├── services
│   ├── auth.service.js
│   └── rbac.service.js
└── utils
    ├── database.js
    ├── jwt.js
    └── response.js
