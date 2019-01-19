import React from 'react';
import MonacoEditor from 'react-monaco-editor';
import classnames from 'classnames';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => {
  const light = theme.palette.type === 'light';
  const bottomLineColor = light ? 'rgba(0, 0, 0, 0.42)' : 'rgba(255, 255, 255, 0.7)';

  return {
    /* Styles applied to the root element. */
    root: {
      position: 'relative',
      marginTop: '16px',
      paddingBottom: '1px',
    },

    /* Styles applied to the root element if the component is focused. */
    focused: {},

    /* Styles applied to the root element if `disabled={true}`. */
    disabled: {},

    error: {},

    underline: {
      '&:after': {
        borderBottom: `2px solid ${theme.palette.primary[light ? 'dark' : 'light']}`,
        left: 0,
        bottom: 0,
        // Doing the other way around crash on IE 11 "''" https://github.com/cssinjs/jss/issues/242
        content: '""',
        position: 'absolute',
        right: 0,
        transform: 'scaleX(0)',
        transition: theme.transitions.create('transform', {
          duration: theme.transitions.duration.shorter,
          easing: theme.transitions.easing.easeOut,
        }),
        pointerEvents: 'none', // Transparent to the hover style.
      },
      '&$focused:after': {
        transform: 'scaleX(1)',
      },
      '&$error:after': {
        borderBottomColor: theme.palette.error.main,
        transform: 'scaleX(1)', // error is always underlined in red
      },
      '&:before': {
        borderBottom: `1px solid ${bottomLineColor}`,
        left: 0,
        bottom: 0,
        // Doing the other way around crash on IE 11 "''" https://github.com/cssinjs/jss/issues/242
        content: '"\\00a0"',
        position: 'absolute',
        right: 0,
        transition: theme.transitions.create('border-bottom-color', {
          duration: theme.transitions.duration.shorter,
        }),
        pointerEvents: 'none', // Transparent to the hover style.
      },
      '&:hover:not($disabled):not($focused):not($error):before': {
        borderBottom: `2px solid ${theme.palette.text.primary}`,
        // Reset on touch devices, it doesn't add specificity
        '@media (hover: none)': {
          borderBottom: `1px solid ${bottomLineColor}`,
        },
      },
      '&$disabled:before': {
        borderBottomStyle: 'dotted',
      },
    },
  };
};

type Props = {
  code: string,
  onChange: (string) => void,
  classes: $Call<typeof styles>,
};

const options = {
  codeLens: false,
  lineNumbers: "off",
  minimap: { enabled: false },
  folding: false,
  scrollBeyondLastLine: false,
  lineHeight: 19,
  lineDecorationsWidth: 0,
  renderLineHighlight: 'none'
};

type State = {
  focused: boolean,
};

class CodeEditor extends React.PureComponent<Props, State> {
  state = {
    focused: false,
  };

  handleEditorDidMount = (editor) => {
    editor.onDidFocusEditorWidget(() => {
      this.setState({ focused: true });
    });

    editor.onDidBlurEditorWidget(() => {
      this.setState({ focused: false });
    });
  };

  render() {
    const { code, onChange, classes } = this.props;

    let lines = (code.match(/\n/g) || '').length + 2;
    const minNumberOfLines = 5;
    if (lines < minNumberOfLines) {
      lines = minNumberOfLines;
    }
    const height = `${lines * options.lineHeight}px`;

    const className = classnames(classes.root, classes.underline, {
      [classes.focused]: this.state.focused,
    });

    return (
      <div className={className}>
        <MonacoEditor
          language="pgsql"
          theme="vs"
          height={height}
          defaultValue={code}
          onChange={onChange}
          options={options}
          editorDidMount={this.handleEditorDidMount}
        />
      </div>
    );
  }
}

export default withStyles(styles)(CodeEditor);
