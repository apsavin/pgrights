import * as React from 'react';
import { observer } from 'mobx-react';
import AccountOutlineIcon from 'mdi-material-ui/AccountOutline';
import DbConnectionsManager from '../../models/DbConnectionsManager';
import Picker from '../Picker';

type Props = {
  dbConnectionsManager: DbConnectionsManager,
};

class DbRolePicker extends React.Component<Props> {

  handleRoleChange = (roleName) => {
    this.props.dbConnectionsManager.setCurrentRole({ roleName });
  };

  render() {
    const { dbConnectionsManager } = this.props;
    const { rolesNames, rolesFetcher } = dbConnectionsManager.getCurrentConnection();
    const { currentRoleName } = dbConnectionsManager;

    return (
      <Picker
        label="Role"
        options={rolesNames}
        value={currentRoleName}
        onChange={this.handleRoleChange}
        Icon={AccountOutlineIcon}
        fetcher={rolesFetcher}
      />
    );
  }
}

export default observer(DbRolePicker);
