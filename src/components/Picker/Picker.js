import * as React from 'react';
import { observer } from 'mobx-react';
import { AutoSizer, List as VirtualizedList, ArrowKeyStepper } from 'react-virtualized';
import withStyles from '@material-ui/core/styles/withStyles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Tooltip from '@material-ui/core/Tooltip';
import TextField from '@material-ui/core/TextField';
import classnames from 'classnames';
import Progress from '../Progress';
import Fetcher from '../../models/Fetcher';

const styles = theme => ({
  labelWrapper: {
    padding: 0,
  },
  label: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  list: {
    flexGrow: 1,
    display: 'flex',
  },
  listInner: {
    flexGrow: 1,
  },
  listItem: {
    paddingLeft: theme.spacing.unit,
    paddingRight: theme.spacing.unit,
    paddingTop: 0,
    paddingBottom: 0,
    height: '32px',
  },
  listItemIcon: {
    marginRight: theme.spacing.unit,
  },
  selectedListItem: {
    backgroundColor: theme.palette.action.hover,
  },
  filter: {
    width: '100%',
    display: 'flex',
    marginTop: theme.spacing.unit,
  },
  filterInnerShift: {
    paddingLeft: theme.spacing.unit,
    paddingRight: theme.spacing.unit,
  },
  progress: {
    flexGrow: 1,
    display: 'flex',
  },
});

type Props = {
  classes: $Call<typeof styles>,
  options: Array<string>,
  value: string,
  Icon: React.ComponentType<{ fontSize: 'small' }>,
  onChange: (string) => void,
  label: string,
  fetcher: Fetcher,
};

class Picker extends React.Component<Props> {

  state = {
    selectedOptionIndex: 0,
    filterValue: '',
    filteredOptions: [],
    options: [],
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const { options, value } = nextProps;

    if (options === prevState.options) {
      return null;
    }

    return {
      selectedOptionIndex: options.findIndex(option => option === value),
      filterValue: '',
      filteredOptions: options,
      options,
    };
  }

  chooseOption = ({ option, index }) => {
    const { onChange } = this.props;
    this.selectOption(index);
    onChange(option);
  };

  selectOption = (index) => {
    this.setState({ selectedOptionIndex: index });
  };

  handleFilterChange = (event) => {
    const { options } = this.props;
    const { value } = event.target;
    this.setState({
      filterValue: value,
      filteredOptions: options.filter(option => option.includes(value)),
      selectedOptionIndex: 0,
    });
  };

  handleFilterKeyDown = (event) => {
    const { selectedOptionIndex: index, filteredOptions: options } = this.state;
    switch (event.key) {
      case 'Enter': {
        this.chooseOption({ index, option: options[index] });
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        const selectedOptionIndex = index > 0 ? index - 1 : options.length - 1;
        this.setState({ selectedOptionIndex });
        break;
      }
      case 'ArrowDown': {
        event.preventDefault();
        const selectedOptionIndex = index >= options.length - 1 ? 0 : index + 1;
        this.setState({ selectedOptionIndex });
        break;
      }
    }
  };

  renderList() {
    const { classes, value, Icon } = this.props;
    const { filteredOptions } = this.state;
    const { selectedOptionIndex } = this.state;

    const rowRenderer = ({ key, index, style }) => {
      const option = filteredOptions[index];

      return (
        <ListItem
          dense
          button
          onClick={() => this.chooseOption({ option, index })}
          selected={option === value}
          className={classnames(classes.listItem, { [classes.selectedListItem]: index === selectedOptionIndex })}
          key={key}
          style={style}
        >
          <ListItemIcon className={classes.listItemIcon}>
            <Icon fontSize="small"/>
          </ListItemIcon>
          <Tooltip title={option}>
            <ListItemText
              primary={option}
              className={classes.labelWrapper}
              primaryTypographyProps={{ className: classes.label, noWrap: true }}
            />
          </Tooltip>
        </ListItem>
      );
    };

    return (
      <AutoSizer>
        {({ width, height }) => (
          <VirtualizedList
            width={width}
            height={height}
            rowCount={filteredOptions.length}
            rowHeight={32}
            rowRenderer={rowRenderer}
            scrollToIndex={selectedOptionIndex}
          />
        )}
      </AutoSizer>
    );
  }

  render() {
    const { classes, label, fetcher } = this.props;
    const { filterValue } = this.state;

    return (
      fetcher.inLoadingState ? (
        <div className={classes.progress}>
          <Progress autoMargin/>
        </div>
      ) : (
        <React.Fragment>
          <TextField
            name="filter"
            value={filterValue}
            label={label}
            onChange={this.handleFilterChange}
            onKeyDown={this.handleFilterKeyDown}
            className={classes.filter}
            inputProps={{ className: classes.filterInnerShift }}
            InputLabelProps={{ className: classes.filterInnerShift }}
          />
          <List className={classes.list}>
            {this.renderList()}
          </List>
        </React.Fragment>
      )
    );
  }
}

export default withStyles(styles)(observer(Picker));
