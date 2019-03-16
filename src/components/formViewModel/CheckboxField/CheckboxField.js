import * as React from 'react';
import { observer } from 'mobx-react';
import Checkbox from '@material-ui/core/Checkbox';
import type FormViewModel from '../../../models/FormViewModel';

type Props = {
  name: string,
  formViewModel: FormViewModel,
  onChange?: ({ event: SyntheticInputEvent<HTMLInputElement>, name: string, value: boolean }) => void,
};

class CheckboxField extends React.Component<Props> {
  handleChange = (event) => {
    const { formViewModel, name, onChange } = this.props;
    formViewModel[name] = !formViewModel[name];

    if (onChange) {
      onChange({ event, name, value: formViewModel[name] });
    }
  };

  render() {
    const { formViewModel, name, ...checkboxProps } = this.props;

    return (
      <Checkbox
        {...checkboxProps}
        checked={formViewModel[name]}
        onChange={this.handleChange}
      />
    );
  }
}

export default observer(CheckboxField);
