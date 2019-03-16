# pgrights
GUI for PostgreSQL roles, privileges and policies

![Main view](https://user-images.githubusercontent.com/632171/54481928-7ccc7800-484c-11e9-917b-0c72e8a2e103.png)

## How to run

Download `dmg` file from the latest [release](https://github.com/apsavin/pgrights/releases) 

or build from source:

```bash
yarn && yarn package
```

## RoadMap and changelog

- [ ] 1.0.0
  - [ ] SQL commands log
  - [ ] Possibility to delete connections
  - [ ] Possibility to delete policies
- [x] [0.2.0](https://github.com/apsavin/pgrights/releases/tag/v0.2.0) 
  - [x] Possibility to edit table and column access
  - [x] View for single policy with SQL syntax highlighting
  - [x] Possibility to edit policies
- [x] [0.1.0](https://github.com/apsavin/pgrights/releases/tag/v0.1.0-alpha) Readonly version
  - [x] Create and edit database connections
  - [x] Possibility to select a schema
  - [x] Possibility to filter and select a table
  - [x] Possibility to filter and select a role
  - [x] View for table and colunm access
  - [x] View for row-level policies
