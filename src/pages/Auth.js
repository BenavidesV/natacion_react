import React, { Component } from 'react';

import './Auth.css';
import AuthContext from '../context/auth-context';

class AuthPage extends Component {
  state = {
    isLogin: true
  };

  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.emailEl = React.createRef();
    this.passwordEl = React.createRef();
    this.identificationEl = React.createRef();
    this.phoneEl = React.createRef();
    this.fullnameEl = React.createRef();
  }

  switchModeHandler = () => {
    this.setState(prevState => {
      return { isLogin: !prevState.isLogin };
    });
  };

  submitHandler = event => {
    event.preventDefault();
    const email = this.emailEl.current.value;
    const password = this.passwordEl.current.value;    


    if (email.trim().length === 0 || password.trim().length === 0) {
      return;
    }

    let requestBody = {
      query: `
        query Login($email: String!, $password: String!) {
          login(email: $email, password: $password) {
            userRole
            userId
            token
            tokenExpiration
          }
        }
      `,
      variables: {
        email: email,
        password: password
      }
    };

    if (!this.state.isLogin) {
      const identification = this.identificationEl.current.value;
      const phone = this.phoneEl.current.value;
      const fullname = this.fullnameEl.current.value;
      requestBody = {
        query: `
          mutation CreateUser($email: String!, $password: String!, $identification: String!, 
            $phone: String, $fullname: String!) {
            createUser(userInput: {email: $email, password: $password, role: "u",
              identification: $identification, phone: $phone, fullname: $fullname}) {
              _id
              email
            }
          }
        `,
        variables: {
          email: email,
          password: password,
          identification: identification,
          phone: phone,
          fullname: fullname
        }
      };
    }

    fetch('http://localhost:8000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Failed!');
        }
        return res.json();
      })
      .then(resData => {
        if (resData.data.login.token) {
          this.context.login(
            resData.data.login.token,
            resData.data.login.userId,
            resData.data.login.userRole,
            resData.data.login.tokenExpiration
          );
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  render() {
    return (
      <form className="auth-form" onSubmit={this.submitHandler}>
        {this.state.isLogin ? (
        <React.Fragment>
          <div className="form-control">
            <label htmlFor="email">E-Mail</label>
            <input type="email" id="email" ref={this.emailEl} />
          </div>
          <div className="form-control">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" ref={this.passwordEl} />
          </div>
        </React.Fragment>
        ) : (
          <React.Fragment>
            <div className="form-control">
            <label htmlFor="email">E-Mail</label>
            <input type="email" id="email" ref={this.emailEl} />
          </div>
            <div className="form-control">
              <label htmlFor="password">Password</label>
              <input type="password" id="password" ref={this.passwordEl} />
            </div>
            <div className="form-control">
              <label htmlFor="fullname">Fullname</label>
              <input type="text" id="fullname" ref={this.fullnameEl} />
            </div>
            <div className="form-control">
              <label htmlFor="identification">ID</label>
              <input type="number" id="identification" ref={this.identificationEl} />
            </div>
            <div className="form-control">
              <label htmlFor="phone">Phone</label>
              <input type="number" id="phone" ref={this.phoneEl} />
            </div>
            
          </React.Fragment>
        )}
        

        <div className="form-actions">
          <button type="submit">Submit</button>
          <button type="button" onClick={this.switchModeHandler}>
            Switch to {this.state.isLogin ? 'Signup' : 'Login'}
          </button>
        </div>
      </form>
    );
  }
}

export default AuthPage;
