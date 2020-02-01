import React from 'react';
import { inject } from 'mobx-react';
import _ from 'lodash';
import flowRight from 'lodash/flowRight';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import DbPolicy from '../../models/DbPolicy';
import { dbPolicyCommandTypes } from '../../models/DbPolicy';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import withFetch, { defaultMap } from '../../hocs/withFetch';
import type { FetchProps } from '../../hocs/withFetch';
import Autocomplete from '../Autocomplete';
import CodeEditor from '../CodeEditor';
import Progress from '../Progress';

type Props = {
  open: boolean,
  policy?: DbPolicy,
  rolesNames: Array<string>,
  onClose: () => void,
} & FetchProps;

class DbPolicyDialogForm extends React.Component<Props> {
  qualifier = null;
  check = null;

  findRolesByText = (text, selectedRolesNames) => {
    const { rolesNames } = this.props;

    const searchString = text.toLowerCase();

    return _(rolesNames)
      .filter(roleName => {
        return roleName.toLowerCase().includes(searchString) && !selectedRolesNames.includes(roleName);
      })
      .take(5)
      .value();
  };

  handleQualifierChange = (qualifier) => {
    this.qualifier = qualifier;
  };

  handleCheckChange = (check) => {
    this.check = check;
  };

  collectPolicyData(event) {
    const initialValues = this.getInitialValues();
    const formData = new FormData(event.currentTarget);
    const data = {};
    for (let [key, value] of formData) {
      data[key] = Array.isArray(initialValues[key]) ? formData.getAll(key) : value;
    }
    return {
      ...data,
      permissive: data.type === 'PERMISSIVE',
      qualifier: this.qualifier === null ? initialValues.qualifier : this.qualifier,
      check: this.check === null ? initialValues.check : this.check,
    }
  };

  handleSavePolicy = async (event) => {
    const { policy, fetch } = this.props;
    event.preventDefault();
    const dataForUpdate = this.collectPolicyData(event);
    const { error } = await fetch(() => DbPolicy.update(policy, dataForUpdate));
    if (!error) {
      this.props.onClose();
    }
  };

  getInitialValues() {
    return this.props.policy || { roles: [], permissive: true, qualifier: '', check: '' };
  }

  render() {
    const { open, policy, onClose, showLoader } = this.props;
    const policyData = this.getInitialValues();

    return (
      <Dialog
        open={open}
        onClose={onClose}
        scroll="body"
      >
        <form onSubmit={this.handleSavePolicy}>
          <DialogTitle>
            {policy ? 'Edit policy' : 'Create policy'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField fullWidth name="name" label="Name" defaultValue={policyData.name}/>
              </Grid>
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel>Type</FormLabel>
                  <RadioGroup
                    row
                    name="type"
                    defaultValue={policyData.permissive ? 'PERMISSIVE' : 'RESTRICTIVE'}
                  >
                    <FormControlLabel value="PERMISSIVE" control={<Radio/>} label="Permissive"/>
                    <FormControlLabel value="RESTRICTIVE" control={<Radio/>} label="Restrictive"/>
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Command</FormLabel>
                  <RadioGroup
                    row
                    name="command"
                    defaultValue={policyData.command || 'SELECT'}
                  >
                    {
                      dbPolicyCommandTypes.map((type) => (
                        <FormControlLabel key={type} value={type} control={<Radio/>} label={_.capitalize(type)}/>
                      ))
                    }
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  name="roles"
                  label="Roles"
                  defaultValue={policyData.roles}
                  getSuggestions={this.findRolesByText}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <FormLabel>Qualifier</FormLabel>
                  <CodeEditor
                    code={policyData.qualifier || ''}
                    onChange={this.handleQualifierChange}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <FormLabel>Check</FormLabel>
                  <CodeEditor
                    code={policyData.check || ''}
                    onChange={this.handleCheckChange}
                  />
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" type="submit" color="primary">
              Save
              { showLoader && <Progress autoMargin absolute size="small" /> }
            </Button>
            <Button variant="outlined" onClick={onClose} color="primary">
              Cancel
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    );
  }
}

const enhance = flowRight(
  withFetch(defaultMap, {
    showSuccessSnackbar: true,
    successSnackbarText: 'Policy saved'
  }),
  inject(({ dbConnectionsManager }) => ({
    rolesNames: dbConnectionsManager.getCurrentConnection().rolesNames,
  })),
);
export default enhance(DbPolicyDialogForm);
