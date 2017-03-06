import React from 'react'

import {
	Form,
	FormGroup,
	FormControl,
	Col,
	Button,
	ControlLabel,
	Link,
	Checkbox
} from 'react-bootstrap'

import _ from 'lodash'

import style from './style.scss'

export default class TemplateModule extends React.Component {

	constructor(props) {
		super(props)

		this.state = {
      loading: true,
      protocol: null,
      host: null,
      port: null,
      user: null,
      password: null,
		  hashState: null
		}
	}

  componentDidMount() {
    this.fetchConfig()
    .then(() => {
      //this.authenticate()
    })
  }

  getAxios = () => this.props.bp.axios
  mApi = (method, url, body) => this.getAxios()[method]('/api/botpress-rocketchat' + url, body)
  mApiGet = (url, body) => this.mApi('get', url, body)
  mApiPost = (url, body) => this.mApi('post', url, body)

  fetchConfig = () => {
    return this.mApiGet('/config').then(({data}) => {
      this.setState({
        protocol: data.protocol,
        host: data.host,
        port: data.port,
        user: data.user,
        password: data.password,
        loading: false
      })

      setImmediate(() => {
        this.setState({
          hashState: this.getHashState()
        });
      })
    });
  }

  getHashState = () => {
    const values = _.omit(this.state, ['loading', 'hashState'])
    return _.join(_.toArray(values), '_')
  }

  handleChange = event => {
    const { name, value } = event.target

    this.setState({
      [name]: value
    })
  }

  handleSaveConfig = () => {
    this.mApiPost('/config', {
      protocol: this.state.protocol,
      host: this.state.host,
      port: this.state.port,
      user: this.state.user,
      password: this.state.password
    })
    .then(({data}) => {
      this.fetchConfig()
    })
    .catch(err => {
      console.log(err)
    })
  }

	renderLabel = label => {
    return (
      <Col componentClass={ControlLabel} sm={3}>
        {label}
      </Col>
    )
  }

	renderInput = (label, name, props = {}) => (
    <FormGroup>
      {this.renderLabel(label)}
      <Col sm={7}>
        <FormControl name={name} {...props}
          value={this.state[name]}
          onChange={this.handleChange} />
      </Col>
    </FormGroup>
  )

  renderPasswordInput = (label, name, props = {}) => this.renderInput(label, name, {
    type: 'password', ...props
  })

	renderTextInput = (label, name, props = {}) => this.renderInput(label, name, {
    type: 'text', ...props
  })

  renderNumericInput = (label, name, props = {}) => this.renderInput(label, name, {
    type: 'number', ...props
  })

	renderSaveButton = () => {
    let opacity = 0
    if (this.state.hashState && this.state.hashState !== this.getHashState()) {
      opacity = 1
    }

    return <Button
        className={style.formButton}
        style={{opacity: opacity}}
        onClick={this.handleSaveConfig}>
          Save
      </Button>
  }

	renderHeader = title => (
    <div className={style.header}>
      <h4>{title}</h4>
      {this.renderSaveButton()}
    </div>
  )

	renderConfigSection = () => {
		return (
			<div className={style.section}>
				{this.renderHeader('Configuration')}
        {this.renderTextInput('Protocol', 'protocol', {
          placeholder: 'http'
        })}
				{this.renderTextInput('Host', 'host', {
					placeholder: 'demo.rocket.chat',
				})}
        {this.renderNumericInput('Port', 'port', {
					placeholder: '80',
				})}
        {this.renderTextInput('User', 'user')}
        {this.renderTextInput('Password', 'password')}
			</div>
		);
	}

  render() {
    return <Col md={10} mdOffset={1}>
			<Form horizontal>
				{this.renderConfigSection()}
			</Form>
		</Col>
  }
}
