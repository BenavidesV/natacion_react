import React, { Component } from 'react';
import { Form } from 'react-bootstrap';
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

            <Form.Group>
              <Form.Label>Email</Form.Label>
              <Form.Control id="email" ref={this.emailEl} placeholder="Ingrese su email"
                type="email" />
              <Form.Text className="text-muted">
                El email con el que se registró.
                </Form.Text>
            </Form.Group>

            <Form.Group>
              <Form.Label>Clave de acceso</Form.Label>
              <Form.Control type="password" placeholder="Contraseña"
                id="password" ref={this.passwordEl} />
            </Form.Group>



          </React.Fragment>
        ) : (
            <React.Fragment>

              <Form.Group>
                <Form.Label>Email</Form.Label>
                <Form.Control id="email" ref={this.emailEl} placeholder="Ingrese su email"
                  type="email" />
              </Form.Group>

              <Form.Group>
                <Form.Label>Clave de acceso</Form.Label>
                <Form.Control type="password" placeholder="Contraseña"
                  id="password" ref={this.passwordEl} />
              </Form.Group>

              <Form.Group>
                <Form.Label>Nombre completo</Form.Label>
                <Form.Control type="text" placeholder="Ingrese su nombre completo"
                  id="fullname" ref={this.fullnameEl} />
              </Form.Group>

              <Form.Group>
                <Form.Label># Identificación</Form.Label>
                <Form.Control type="number" placeholder="Ingrese su # de identificación"
                  id="identification" ref={this.identificationEl} />
              </Form.Group>

              <Form.Group>
                <Form.Label>Teléfono</Form.Label>
                <Form.Control type="number" placeholder="Ingrese su # de teléfono"
                  id="phone" ref={this.phoneEl} />
              </Form.Group>



            </React.Fragment>
          )}


        <div className="form-actions">
          <button type="submit">Enviar</button>
          <button type="button" onClick={this.switchModeHandler}>
            {this.state.isLogin ? 'No tengo cuenta. Crear' : 'Tengo cuenta. Iniciar sesión'}
          </button>
        </div>
      </form>
    );
  }
}

export default AuthPage;
