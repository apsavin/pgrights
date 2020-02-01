import * as React from 'react';
import { observer } from 'mobx-react';
import withStyles from '@material-ui/core/styles/withStyles';
import Paper from '@material-ui/core/Paper';
import Picker from '../Picker';
import TableLargeIcon from 'mdi-material-ui/TableLarge';
import Select from '../Select';
import DbConnectionsManager from '../../models/DbConnectionsManager';

const styles = theme => ({
  paper: {
    padding: theme.spacing(2),
    [theme.breakpoints.up(600 + theme.spacing(3 * 2))]: {
      padding: theme.spacing(3),
    },
  },
  selectWrapper: {
    marginTop: '8px',
  },
  select: {
    width: '100%',
  },
});

type Props = {
  classes: $Call<typeof styles>,
  dbConnectionsManager: DbConnectionsManager,
};

class DbTablePicker extends React.Component<Props> {

  handleSchemaChange = (event) => {
    this.props.dbConnectionsManager.setCurrentSchema({ schemaName: event.target.value });
  };

  handleTableChange = (tableName) => {
    this.props.dbConnectionsManager.setCurrentTable({ tableName });
  };

  render() {
    const { classes, dbConnectionsManager } = this.props;
    const { schemasNames } = dbConnectionsManager.getCurrentConnection();
    const { tablesNames, tablesFetcher } = dbConnectionsManager.getCurrentSchema();
    const { currentSchemaName, currentTableName } = dbConnectionsManager;

    return (
      <React.Fragment>
        <Paper square elevation={0} className={classes.selectWrapper}>
          <Select
            value={currentSchemaName}
            name="schemas"
            label="Schema"
            dataForOptions={schemasNames}
            onChange={this.handleSchemaChange}
            className={classes.select}
          />
        </Paper>
        <Picker
          label="Table"
          options={tablesNames}
          value={currentTableName}
          Icon={TableLargeIcon}
          onChange={this.handleTableChange}
          fetcher={tablesFetcher}
        />
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(observer(DbTablePicker));
