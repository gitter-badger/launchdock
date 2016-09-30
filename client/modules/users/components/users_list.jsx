import React from 'react';
import Helmet from 'react-helmet';
import { Grid, Row, Col, Panel, Table, Button, ButtonToolbar } from 'react-bootstrap';
import InvitesList from '../containers/invites_list';

class UsersList extends React.Component {

  handleDeleteUser(id) {
    const { deleteUser } = this.props;
    deleteUser(id);
  }

  render() {
    const { users, invites, canDelete, context } = this.props;
    const { Meteor } = context();

    return (
      <Grid fluid={true}>
        <Helmet title='Users' />
        <Row>
          <Col md={10} mdOffset={1}>
            <Panel>
              <h3>Active Users</h3>
              <hr/>
              <Table bordered responsive className='users-table'>
                <thead>
                  <tr>
                    <th className='text-center'>Username</th>
                    <th className='text-center'>Email Address</th>
                    <th className='text-center'>Role</th>
                    <th className='text-center'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    return (
                      <tr key={user._id}>
                        <td className='text-center'>
                          {user.username}
                          {user._id === Meteor.userId() ?
                            <span className='flag'>You!</span>
                            : null }
                        </td>
                        <td className='text-center'>
                          {user.emails[0].address}
                        </td>
                        <td className='text-center'>
                          {user.roles.toString()}
                        </td>
                        <td>
                          <ButtonToolbar>
                            <Button bsStyle='primary' href={`/users/${user._id}`}>
                              Profile
                            </Button>
                            {canDelete(user._id) ?
                              <Button
                                bsStyle='danger'
                                className='delete-user'
                                onClick={this.handleDeleteUser.bind(this, user._id)}>
                                Delete
                              </Button>
                              : null }
                          </ButtonToolbar>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Panel>
          </Col>
        </Row>
        <InvitesList invites={invites} />
      </Grid>
    );
  }
}

UsersList.propTypes = {
  canDelete: React.PropTypes.func.isRequired,
  context: React.PropTypes.func.isRequired,
  deleteUser: React.PropTypes.func.isRequired,
  invites: React.PropTypes.array.isRequired,
  users: React.PropTypes.array.isRequired
};

export default UsersList;
