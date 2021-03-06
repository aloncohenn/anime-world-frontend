import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ForumApiService from '../../services/forum-api-service';
import TokenService from '../../services/token-service';
import jwtDecode from 'jwt-decode';
import axios from 'axios';
import config from '../../config';
import './Forum.css';

class Forum extends Component {
  state = {
    comments: [],
    isFetching: false,
    isAuthenticated: false
  };

  componentDidMount = () => {
    this.handleGetComments();
    // this.authenticateUser();
    this.timer = setInterval(() => this.handleGetComments(), 1000);
  };

  componentWillUnmount = () => {
    clearInterval(this.timer);
    this.timer = null;
  };

  handleGetComments = () => {
    const { title } = this.props;
    axios({
      method: 'get',
      url: `${config.API_ENDPOINT}/forum/${title}`,
      headers: {
        authorization: `bearer ${TokenService.getAuthToken()}`,
        'content-type': 'application/json'
      }
    })
      .then(res => {
        this.setState({ comments: res.data });
      })
      .catch(error => error.response.data.errors);
  };

  handleDeleteComment = async id => {
    await ForumApiService.deleteComment(id);
  };

  handleEditComment = (id, newComment) => {
    // TODO: add input button to comment component
    // TODO: functionality for editing comments
    console.log('edit comment', id, newComment);
  };

  render() {
    let isOwner;
    const { comments } = this.state;
    const commentList = comments.map((comment, index) => {
      if (TokenService.hasAuthToken()) {
        const authToken = TokenService.getAuthToken();
        const decoded = jwtDecode(authToken);
        isOwner = decoded.user_id === comment.user_id;
      }
      return (
        <li key={index}>
          <FontAwesomeIcon icon="comment" color="#ab24a1" size="lg" />
          <p>{comment.user_name}</p>
          <p className="comment">{comment.comment}</p>
          <p>{comment.date_created.slice(0, 7)}</p>

          {isOwner && (
            <div>
              <button onClick={() => this.handleEditComment(comment.id)}>
                {' '}
                <FontAwesomeIcon icon="edit" color="#ffffff" size="sm" />{' '}
              </button>
              <button onClick={() => this.handleDeleteComment(comment.id)}>
                {' '}
                <FontAwesomeIcon icon="trash-alt" color="#ffffff" size="sm" />
              </button>
            </div>
          )}
        </li>
      );
    });
    return (
      <section className="forum_container">
        <h1>Comments</h1>
        <ul>{commentList}</ul>
      </section>
    );
  }
}

export default Forum;
