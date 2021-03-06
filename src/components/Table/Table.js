import * as React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import MuiTable from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

const styles = theme => ({
  table: {
    tableLayout: 'fixed',
    width: '100%',
  },
});

type Props = {
  columns: Array<{ name: string, header: React.Node }>,
  data: Array<mixed>,
  rowRenderer?: (mixed) => React.Node,
  noRowsRenderer?: (mixed) => React.Node,
  rowKey: (mixed) => string,
};

class Table extends React.Component<Props> {

  rowRenderer = (tableRow) => {
    const { columns } = this.props;

    return (
      <React.Fragment>
        {columns.map(column => {
          const { cell = (data) => data[column.name] } = column;
          return (
            <TableCell>{cell(tableRow)}</TableCell>
          );
        })}
      </React.Fragment>
    );
  };

  render() {
    const { columns, data, classes, rowRenderer = this.rowRenderer, rowKey, noRowsRenderer } = this.props;

    return (
      <MuiTable padding="checkbox" className={classes.table}>
        <TableHead>
          <TableRow>
            {columns.map(column => {
              return (
                <TableCell key={column.name}>{column.header}</TableCell>
              );
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {
            data.map((datum, i) => {
              return (
                <TableRow key={rowKey(datum, i)}>
                  {rowRenderer(datum)}
                </TableRow>
              );
            })
          }
          {noRowsRenderer && !data.length && (
            <TableRow>
              <TableCell colSpan={columns.length}>
                {noRowsRenderer()}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </MuiTable>
    );
  }
}

export default withStyles(styles)(Table);
