import React from 'react';
import { TouchableOpacity } from 'react-native';

import { isAndroid } from '../../lib/methods/helpers/deviceInfo';
import Touch from '../../utils/touch';

// Taken from https://github.com/rgommezz/react-native-scroll-bottom-sheet#touchables
export const Button: typeof React.Component = isAndroid ? Touch : TouchableOpacity;
