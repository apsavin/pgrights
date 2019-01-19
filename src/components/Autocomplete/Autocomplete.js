import React from 'react';
import Downshift from 'downshift';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import MenuItem from '@material-ui/core/MenuItem';
import Chip from '@material-ui/core/Chip';
import Popper from '@material-ui/core/Popper';

function renderInput(inputProps) {
  const { InputProps, classes, ref, ...other } = inputProps;

  return (
    <TextField
      InputProps={{
        inputRef: ref,
        classes: {
          root: classes.inputRoot,
          input: classes.inputInput,
        },
        ...InputProps,
      }}
      {...other}
    />
  );
}

type RenderSuggestionArg = {
  highlightedIndex: number,
  index: number,
  itemProps: Object,
  selectedItem: Array<string>,
  suggestion: string | { label: string },
};

function renderSuggestion({ suggestion, index, itemProps, highlightedIndex, selectedItem }: RenderSuggestionArg) {
  const isHighlighted = highlightedIndex === index;
  const label = typeof suggestion === 'string' ? suggestion : suggestion.label;
  const isSelected = (selectedItem || []).includes(label);

  return (
    <MenuItem
      {...itemProps}
      key={label}
      selected={isHighlighted}
      component="div"
      style={{
        fontWeight: isSelected ? 600 : 400,
      }}
    >
      {label}
    </MenuItem>
  );
}

const styles = theme => ({
  container: {
    flexGrow: 1,
    position: 'relative',
  },
  chip: {
    margin: `${theme.spacing.unit / 2}px ${theme.spacing.unit / 4}px`,
  },
  inputRoot: {
    flexWrap: 'wrap',
  },
  inputInput: {
    width: 'auto',
    flexGrow: 1,
  },
  hidden: {
    display: 'none',
  },
  popper: {
    zIndex: 2000,
  },
});

type Props = {
  placeholder?: string,
  label: string,
  name: string,
  getSuggestions: (value: string) => Array<{ label: string }>,
  classes: $Call<typeof styles>,
  defaultValue: Array<string>,
  onChange: (Array<string>) => void,
};

class Autocomplete extends React.Component<Props> {
  state = {
    inputValue: '',
    selectedItem: [],
    defaultValue: [],
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const { defaultValue } = nextProps;

    if (defaultValue === prevState.defaultValue) {
      return null;
    }

    return {
      inputValue: '',
      selectedItem: defaultValue,
      defaultValue,
    };
  }

  static defaultProps = {
    defaultValue: [],
  };

  handleKeyDown = event => {
    const { inputValue, selectedItem } = this.state;
    if (selectedItem.length && !inputValue.length && event.key === 'Backspace') {
      this.setState({
        selectedItem: selectedItem.slice(0, selectedItem.length - 1),
      });
    }
  };

  handleInputChange = event => {
    this.setState({ inputValue: event.target.value });
  };

  handleChange = item => {
    let { selectedItem } = this.state;

    if (selectedItem.indexOf(item) === -1) {
      selectedItem = [...selectedItem, item];
    }

    this.setState({
      inputValue: '',
      selectedItem,
    });
  };

  handleDelete = item => () => {
    this.setState(state => {
      const selectedItem = [...state.selectedItem];
      selectedItem.splice(selectedItem.indexOf(item), 1);
      return { selectedItem };
    });
  };

  render() {
    const { classes, placeholder, label, getSuggestions, name } = this.props;
    const { inputValue, selectedItem } = this.state;

    return (
      <Downshift
        inputValue={inputValue}
        onChange={this.handleChange}
        selectedItem={selectedItem}
      >
        {({
            getInputProps,
            getItemProps,
            getMenuProps,
            isOpen,
            inputValue: currentInputValue,
            selectedItem: currentSelectedItem,
            highlightedIndex,
          }) => {
          const popperNode = this.popperNode;
          const shrink = Boolean(
            selectedItem.length ||
            (popperNode && popperNode.value) ||
            popperNode === document.activeElement,
          );
          return (
            <div className={classes.container}>
              {renderInput({
                fullWidth: true,
                classes,
                label,
                ref: node => {
                  this.popperNode = node;
                },
                InputLabelProps: { shrink },
                InputProps: getInputProps({
                  startAdornment: selectedItem.map(item => (
                    <Chip
                      key={item}
                      tabIndex={-1}
                      label={item}
                      className={classes.chip}
                      onDelete={this.handleDelete(item)}
                    />
                  )),
                  onChange: this.handleInputChange,
                  onKeyDown: this.handleKeyDown,
                  placeholder,
                }),
              })}
              <Popper open={isOpen} anchorEl={popperNode} className={classes.popper}>
                <Paper square style={{ marginTop: 8, width: popperNode ? popperNode.clientWidth : null }}>
                  {getSuggestions(currentInputValue, currentSelectedItem).map((suggestion, index) =>
                    renderSuggestion({
                      suggestion,
                      index,
                      itemProps: getItemProps({ item: suggestion.label || suggestion }),
                      highlightedIndex,
                      selectedItem: currentSelectedItem,
                    }),
                  )}
                </Paper>
              </Popper>
              {selectedItem.map(item => (
                <input
                  type="checkbox"
                  name={name}
                  key={item}
                  className={classes.hidden}
                  value={item}
                  checked
                  readOnly
                />
              ))}
            </div>
          );
        }}
      </Downshift>
    );
  }
}

export default withStyles(styles)(Autocomplete);
