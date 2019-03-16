import { ViewModel } from 'mobx-utils';
import { observable, keys } from 'mobx';
import { mapValues } from 'lodash';

type FieldConfig<Value> = {
  get: () => Value,
  set: (Value) => void,
};

type FieldsConfig = {
  [fieldName: string]: FieldConfig<*>,
};

class FormViewModel extends ViewModel {
  constructor(fieldsConfig: FieldsConfig) {
    const initialValues = mapValues(fieldsConfig, (value, path) => {
      return fieldsConfig[path].get();
    });
    const formModel = observable(initialValues);
    super(formModel);
    this.fieldsConfig = fieldsConfig;
  }

  submit() {
    keys(this.localValues).forEach((key) => {
      const newValue = this.localValues.get(key);
      this.fieldsConfig[key].set(newValue);
    });
    this.localValues.clear()
  }
}

export default FormViewModel;
