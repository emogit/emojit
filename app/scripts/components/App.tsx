import React from 'react'
import Badges from './Badges'
import Options from './Options'

export default class App extends React.Component<any, {
	page: 'badges' | 'options'
}> {
	constructor(props: any) {
		super(props)
		this.state = {
			page: 'options',
		}
	}

	render() {
		switch (this.state.page) {
			case 'badges':
				return <Badges />
			case 'options':
				return <Options />
		}
	}
}