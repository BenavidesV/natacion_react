import React, { Component } from 'react';
import { Form } from 'react-bootstrap';
import ReCAPTCHA from 'react-google-recaptcha';
import './Auth.css';
import AuthContext from '../context/auth-context';
import CookieConsent from "react-cookie-consent";
import { Button, notification } from 'antd';

class AuthPage extends Component {
  state = {
    isLogin: true
  };

  openNotification = (message,type) => {
    notification[type]({
    message: '',
    description:
      message,
  });

};
  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.emailEl = React.createRef();
    this.passwordEl = React.createRef();
    this.identificationEl = React.createRef();
    this.phoneEl = React.createRef();
    this.fullnameEl = React.createRef();

    this.handleCaptchaResponseChange = this.handleCaptchaResponseChange.bind(this);
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
      this.openNotification("Hay campos requeridos sin completar",'warning');
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
    fetch('https://api-swimming.herokuapp.com/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res=> {
        return res.json();
      })
      .then(resData => {
        if (resData.data.createUser) {
          this.setState({ isLogin: true })
        } else {
          if (resData.data.login.token) {
            this.context.login(
              resData.data.login.token,
              resData.data.login.userId,
              resData.data.login.userRole,
              resData.data.login.tokenExpiration
            );
          }
        }

        })
      .then(errors => {
        console.log("handle.res: "+errors.errors[0].message);
        if (errors.errors[0].message=="Password is incorrect!") {
          this.openNotification("Los datos suministrados no coinciden con nuestros registros",'error');
        }
        if (errors.errors[0].message=="User exists already.") {
          this.openNotification("Ese usuario ya existe en nuestros registros",'warning');
        }
        if (!errors.ok) throw new Error(errors.error);
         throw new Error(errors);
      })

      .catch(err => {
        console.log("desde el catch "+err);
      });
  };
  handleCaptchaResponseChange(response) {
    //this.recaptcha.reset();
    this.setState({
      recaptchaResponse: response,
    });

  }


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
              <ReCAPTCHA
                ref={(el) => { this.recaptcha = el; }}
                sitekey="6LcBCtcZAAAAABFgyRnSox89AdfkmxVbWWw19773"
                onChange={this.handleCaptchaResponseChange}
              />


            </React.Fragment>
          )}


        <div className="form-actions">
          <button type="submit">Enviar</button>
          <button type="button" onClick={this.switchModeHandler}>
            {this.state.isLogin ? 'Crear cuenta' : 'Tengo cuenta. Iniciar sesión'}
          </button>
        </div>
        <CookieConsent
          location="bottom"
          buttonText="Entendido"
          cookieName="myAwesomeCookieName2"
          style={{ background: "#2B373B" }}
          buttonStyle={{ color: "#4e503b", fontSize: "13px" }}
          expires={150}
        >
          Este sitio usa cookies para optimizar su experiencia como usuario
        </CookieConsent>
      </form>
    )
  }
}

export default AuthPage;
