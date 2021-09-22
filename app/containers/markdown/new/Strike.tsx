/* eslint-disable react/no-array-index-key */
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Strike as StrikeProps } from '@rocket.chat/message-parser';

import Bold from './Bold';
import Italic from './Italic';
import Plain from './Plain';

interface IStrikeProps {
	value: StrikeProps['value'];
}

const styles = StyleSheet.create({
	text: {
		textDecorationLine: 'line-through'
	}
});

const Strike: React.FC<IStrikeProps> = ({ value }) => (
	<Text style={styles.text}>
		{value.map(block => {
			switch (block.type) {
				case 'PLAIN_TEXT':
					return <Plain value={block.value} />;
				case 'BOLD':
					return <Bold value={block.value} />;
				case 'ITALIC':
					return <Italic value={block.value} />;
				default:
					return null;
			}
		})}
	</Text>
);

export default Strike;