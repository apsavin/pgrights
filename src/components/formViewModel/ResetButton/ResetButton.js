import * as React from 'react';
import { observer } from 'mobx-react';
import Button from '@material-ui/core/Button';
import type FormViewModel from '../../../models/FormViewModel';

type Props = {
  formViewModel: FormViewModel,
};

class ResetButton extends React.Component<Props> {
  handleClick = () => {
    this.props.formViewModel.reset();
  };

  render() {
    const { formViewModel, ...buttonProps } = this.props;

    return (
      <Button
        variant="outlined"
        color="primary"
        {...buttonProps}
        disabled={!formViewModel.changedValues.size}
        onClick={this.handleClick}
      >
        Reset
      </Button>
    );
  }
}

export default observer(ResetButton);
