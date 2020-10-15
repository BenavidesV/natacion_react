import React from 'react';
import { NavLink } from 'react-router-dom';

import AuthContext from '../../context/auth-context';
import './MainNavigation.css';

const mainNavigation = props => (
  <AuthContext.Consumer>
    {context => {
      return (
        <header className="main-navigation">
          <div className="main-navigation__logo">
            <img
              src="favicon.ico"
              alt="Asociación Deportiva de Natación Ciudad Quesada"
              width="57rem"
              className="rounded-img"
              title="Asociación Deportiva de Natación Ciudad Quesada">
            </img>
            <h4 className="main-navigation__items"></h4>
          </div>
          <nav className="main-navigation__items">
            <ul>
              {!context.token && (
                <li>
                  <NavLink to="/auth">Autenticar</NavLink>
                </li>
              )}
              <li>
                <NavLink to="/events">Horarios</NavLink>
              </li>
              {context.token && (
                <React.Fragment>
                  <li>
                    <NavLink to="/bookings">Reservaciones</NavLink>
                  </li>
                  <li>
                    <button onClick={context.logout}>Cerrar sesión</button>
                  </li>
                </React.Fragment>
              )}
            </ul>
          </nav>
        </header>
      );
    }}
  </AuthContext.Consumer>
);

export default mainNavigation;
