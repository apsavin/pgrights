import * as React from 'react';
import { observer } from 'mobx-react';
import Button from '@material-ui/core/Button';
import type FormViewModel from '../../../models/FormViewModel';
import Progress from '../../Progress';

type Props = {
  showLoader: boolean,
  formViewModel: FormViewModel,
};

class SubmitButton extends React.Component<Props> {

  render() {
    const { formViewModel, showLoader, ...buttonProps } = this.props;

    return (
      <Button
        variant="contained"
        type="submit"
        color="primary"
        {...buttonProps}
        disabled={!formViewModel.changedValues.size}>
        Save
        { showLoader && <Progress autoMargin absolute size="small" /> }
      </Button>
    );
  }
}

export default observer(SubmitButton);
