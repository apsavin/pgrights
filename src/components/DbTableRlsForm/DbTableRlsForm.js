import * as React from 'react';
import { capitalize } from 'lodash';
import { observer } from 'mobx-react';
import { AutoSizer } from 'react-virtualized';
import withStyles from '@material-ui/core/styles/withStyles';
import Typography from '@material-ui/core/Typography';
import Checkbox from '@material-ui/core/Checkbox';
import Tooltip from '@material-ui/core/Tooltip';
import MuiTable from 'mui-virtualized-table';
import DbConnectionsManager from '../../models/DbConnectionsManager';

const styles = theme => ({
  tableNameWrapper: {
    padding: 0,
  },
  tableName: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  list: {
    height: '100%',
  },
});

type Props = {
  classes: $Call<typeof styles>,
  dbConnectionsManager: DbConnectionsManager,
};

class DbTableRlsForm extends React.Component<Props> {

  render() {
    const { dbConnectionsManager } = this.props;
    const currentTable = dbConnectionsManager.getCurrentTable();
    const role = dbConnectionsManager.currentRoleName;
    const policiesTableData = currentTable ? currentTable.policies.getPolicies(role).map(policy => {
      return {
        id: policy.name,
        ...policy
      };
    }) : [];

    return (
      <AutoSizer disableHeight>
        {({ width }) => (
          <MuiTable
            data={policiesTableData}
            columns={[
              {
                name: 'id',
                header: <Typography variant="h6">Name</Typography>,
                cellProps: { padding: 'checkbox' },
                cell: ({ name }) => <Tooltip title={name}><Typography variant="body2">{name}</Typography></Tooltip>,
              },
              {
                name: 'permissive',
                header: <Typography variant="h6">Permissive</Typography>,
                cellProps: { padding: 'checkbox' },
                cell: (row) => <Checkbox checked={row.permissive}/>,
              },
              {
                name: 'command',
                header: <Typography variant="h6">Command</Typography>,
                cellProps: { padding: 'checkbox' },
              },
              {
                name: 'qualifier',
                header: <Typography variant="h6">Qualifier</Typography>,
                cellProps: { padding: 'checkbox' },
                cell: ({ qualifier }) => <Tooltip title={qualifier}><Typography variant="body2">{qualifier}</Typography></Tooltip>,
              },
              {
                name: 'check',
                header: <Typography variant="h6">With check</Typography>,
                cellProps: { padding: 'checkbox' },
                cell: ({ check }) => <Tooltip title={check}><Typography variant="body2">{check}</Typography></Tooltip>,
              },
            ]}
            width={width}
            maxHeight={500}
            fixedRowCount={1}
            includeHeaders
          />
        )}
      </AutoSizer>
    );
  }
}

export default withStyles(styles)(observer(DbTableRlsForm));
