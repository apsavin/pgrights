import * as React from 'react';
import { observer, inject } from 'mobx-react';
import PanelGroup from 'react-panelgroup';
import withStyles from '@material-ui/core/styles/withStyles';
import type Router from '../../models/Router';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ChevronDownIcon from 'mdi-material-ui/ChevronDown';
import type DbConnectionsManager from '../../models/DbConnectionsManager';
import PageLayout from '../../components/PageLayout';
import DbRolePicker from '../../components/DbRolePicker';
import DbTablePicker from '../../components/DbTablePicker';
import DbTableGrantsForm from '../../components/DbTableGrantsForm';

const styles = theme => ({
  paper: {
    padding: theme.spacing.unit * 2,
    [theme.breakpoints.up(600 + theme.spacing.unit * 3 * 2)]: {
      padding: theme.spacing.unit * 3,
    },
  },
  sideWrapper: {
    height: '100vh',
    width: '100%',
    overflow: 'auto',
  },
  centerWrapper: {
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 2,
    width: '100%',
    overflow: 'auto',
  },
  grantsPanel: {
    flexDirection: 'column',
  },
});

type Props = {
  classes: $Call<typeof styles>,
  router: Router,
  dbConnectionsManager: DbConnectionsManager,
};

class RightsPage extends React.Component<Props> {
  panelWidths = [
    { size: 180, minSize: 100, resize: 'dynamic' },
    { minSize: 100, resize: 'stretch' },
    { size: 180, minSize: 100, resize: 'dynamic' },
  ];

  handlePanelsUpdate = (panelWidths) => {
    this.panelWidths = panelWidths;
  };

  render() {
    const { classes, dbConnectionsManager } = this.props;

    return (
      <PageLayout>
        <PanelGroup
          panelWidths={this.panelWidths}
          spacing={1}
          borderColor="#ccc"
          panelColor="#fff"
          onUpdate={this.handlePanelsUpdate}
        >
          <Paper square elevation={0} className={classes.sideWrapper}>
            <DbTablePicker dbConnectionsManager={dbConnectionsManager}/>
          </Paper>
          <Paper square elevation={0} className={classes.centerWrapper}>
            <ExpansionPanel defaultExpanded>
              <ExpansionPanelSummary expandIcon={<ChevronDownIcon/>}>
                <Typography variant="h4">
                  Granted permissions
                </Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails className={classes.grantsPanel}>
                <DbTableGrantsForm dbConnectionsManager={dbConnectionsManager}/>
              </ExpansionPanelDetails>
            </ExpansionPanel>
            <ExpansionPanel defaultExpanded>
              <ExpansionPanelSummary expandIcon={<ChevronDownIcon/>}>
                <Typography variant="h4">
                  Row level security
                </Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <Typography>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex,
                  sit amet blandit leo lobortis eget.
                </Typography>
              </ExpansionPanelDetails>
            </ExpansionPanel>
          </Paper>
          <Paper square elevation={0} className={classes.sideWrapper}>
            <DbRolePicker dbConnectionsManager={dbConnectionsManager}/>
          </Paper>
        </PanelGroup>
      </PageLayout>
    );
  }
}

export default inject(({ dbConnectionsManager }) => ({
  dbConnectionsManager,
}))(withStyles(styles)(observer(RightsPage)));
