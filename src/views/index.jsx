import React from 'react'

import {
  Panel,
  Grid,
  Row,
  Col,
  ControlLabel,
  FormGroup,
  FormControl,
  Alert,
  FieldGroup,
  Button
} from 'react-bootstrap'

import style from './style.scss'

export default class TemplateModule extends React.Component {

  constructor(props) {
		super(props)

		this.state = {
      loading: true,
      scheme: null,
      host: null,
      port: null,
      user: null,
      password: null,
      message: null,
      initialStateHash: null
    }

    this.renderFields = this.renderFields.bind(this)

    this.handleSchemeChange = this.handleSchemeChange.bind(this)
    this.handleHostChange = this.handleHostChange.bind(this)
    this.handlePortChange = this.handlePortChange.bind(this)
    this.handleUserChange = this.handleUserChange.bind(this)
    this.handlePasswordChange = this.handlePasswordChange.bind(this)

    this.handleSaveChanges = this.handleSaveChanges.bind(this)
	}

  getStateHash() {
    return this.state.scheme + ' ' +
          this.state.host + ' ' +
          this.state.port + ' ' +
          this.state.user + ' ' +
          this.state.password
  }

  getAxios() {
    return this.props.bp.axios
  }

  componentDidMount() {
    this.getAxios().get('/api/botpress-rocketchat/config')
    .then((res) => {
      this.setState({
        loading: false,
        ...res.data
      })

      setImmediate(() => {
        this.setState({ initialStateHash: this.getStateHash() })
      })
    })
  }

  handleSchemeChange(event) {
    this.setState({
      scheme: event.target.value
    })
  }

  handleHostChange(event) {
    this.setState({
      host: event.target.value
    })
  }

  handlePortChange(event) {
    this.setState({
      port: event.target.value
    })
  }

  handleUserChange(event) {
    this.setState({
      user: event.target.value
    })
  }

  handlePasswordChange(event) {
    this.setState({
      password: event.target.value
    })
  }

  handleSaveChanges() {
    this.setState({ loading:true })

    return this.getAxios().post('/api/botpress-rocketchat/config', {
      scheme: this.state.scheme,
      host: this.state.host,
      port: this.state.port,
      user: this.state.user,
      password: this.state.password
    })
    .then(() => {
      this.setState({
        loading: false,
        initialStateHash: this.getStateHash()
      })
    })
    .catch((err) => {
      this.setState({
        message: {
          type: 'danger',
          text: 'An error occured during you were trying to save configuration: ' + err.response.data.message
        },
        loading: false,
        initialStateHash: this.getStateHash()
      })
    })
  }

  renderFields() {
    return (
      <div className="form-horizontal">
        <FormGroup>
          <Col componentClass={ControlLabel} sm={3}>
            Scheme
          </Col>
          <Col sm={8}>
            <FormControl type="text" value={this.state.scheme} placeholder="http" onChange={this.handleSchemeChange}/>
          </Col>
        </FormGroup>

        <FormGroup>
          <Col componentClass={ControlLabel} sm={3}>
            Host
          </Col>
          <Col sm={8}>
            <FormControl type="url" value={this.state.host} placeholder="https://open.rocket.chat" onChange={this.handleHostChange}/>
          </Col>
        </FormGroup>

        <FormGroup>
          <Col componentClass={ControlLabel} sm={3}>
            Port
          </Col>
          <Col sm={8}>
            <FormControl type="number" value={this.state.port} placeholder="3000" onChange={this.handlePortChange}/>
          </Col>
        </FormGroup>

        <FormGroup>
          <Col componentClass={ControlLabel} sm={3}>
            User
          </Col>
          <Col sm={8}>
            <FormControl type="text" value={this.state.user} placeholder="xxxx" onChange={this.handleUserChange} />
          </Col>
        </FormGroup>

        <FormGroup>
          <Col componentClass={ControlLabel} sm={3}>
            Password
          </Col>
          <Col sm={8}>
            <FormControl type="password" value={this.state.password} placeholder="xxxx" onChange={this.handlePasswordChange} />
          </Col>
        </FormGroup>
      </div>
    )
  }

  renderMessageAlert() {
    return this.state.message
      ? <Alert bsStyle={this.state.message.type}>{this.state.message.text}</Alert>
      : null
  }

  renderSaveButton() {
    const disabled = !(this.state.initialStateHash && this.state.initialStateHash !== this.getStateHash())

    return <Button disabled={disabled} bsStyle="success" onClick={this.handleSaveChanges}>Save</Button>
  }

  renderHeader = title => (
    <div className={style.header}>
      <h4>{title}</h4>
    </div>
  )

  render() {
    if (this.state.loading) {
      return <h4>Module is loading...</h4>
    }
    return (
      <Grid>
        <Row>
          <Col md={8} mdOffset={2}>
            {this.renderMessageAlert()}

            <Panel header="Settings" footer={this.renderSaveButton()}>
              {this.renderFields()}
            </Panel>
          </Col>
        </Row>
      </Grid>
    );
  }
}
