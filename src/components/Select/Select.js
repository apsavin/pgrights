import * as React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MuiSelect from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

const styles = theme => ({
  label: {
    paddingLeft: theme.spacing.unit,
  },
  selectMenu: {
    paddingLeft: theme.spacing.unit,
  }
});

type Props = {
  value: string,
  defaultValue: string,
  classes: $Call<typeof styles>,
  children: React.Node,
  onChange: (Event) => void,
  className: string,
};
type State = {
  value: string,
};

class Select extends React.Component<Props, State> {
  state = {
    value: this.props.defaultValue,
  };

  handleChange = (event) => {
    if (!this.props.value) {
      this.setState({ value: event.target.value });
    }
    this.props.onChange(event);
  };

  render() {
    const { classes, dataForOptions, labelKeyName, valueKeyName, name, id, label, className } = this.props;

    return (
      <FormControl className={className}>
        <InputLabel htmlFor={id} className={classes.label}>{label}</InputLabel>
        <MuiSelect
          value={this.props.value || this.state.value}
          onChange={this.handleChange}
          inputProps={{ name, id }}
          classes={{ selectMenu: classes.selectMenu }}
        >
          {
            dataForOptions.map((datum) => {
              const value = typeof datum === 'string' ? datum : datum[valueKeyName];
              const label = typeof datum === 'string' ? datum : datum[labelKeyName];
              return (
                <MenuItem value={value} key={value}>{label}</MenuItem>
              );
            })
          }
        </MuiSelect>
      </FormControl>
    );
  }
}

export default withStyles(styles)(Select);
