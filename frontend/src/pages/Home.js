import React, { Component } from "react";
import { Navigate } from "react-router-dom"

export default class Home extends Component {

  constructor(props) {
    super(props);

    this.state = {
      checkedIfLoggedIn: false,
      isLoggedIn: null,
      username: localStorage.getItem("username")
    }

  }

  componentDidMount() {
      // Send POST request to check if user is logged in
    //   fetch("http://localhost:3001/checkifloggedin",
    //     {
    //       method: "POST",
    //       credentials: "include"
    //     })
    //     .then(response => response.json())
    //     .then(body => {
    //       if (body.isLoggedIn) {
    //         this.setState({ checkedIfLoggedIn: true, isLoggedIn: true, username: localStorage.getItem("username")});
    //       } else {
    //         this.setState({ checkedIfLoggedIn: true, isLoggedIn: false });
    //       }
    //     });
  }

  render() {
    // if (!this.state.checkedIfLoggedIn) {
    //   // delay redirect/render
    //   return (<div></div>)
    // }

    // if (!this.state.isLoggedIn) {
    //   return <Navigate to="/login" />
    // }
    // else {
    //   return <Navigate to="/entrylist" />
    // }
    return <Navigate to="/entrylist" />
  }
}
