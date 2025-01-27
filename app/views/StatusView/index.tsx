import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { setUser } from '../../actions/login';
import * as HeaderButton from '../../containers/HeaderButton';
import * as List from '../../containers/List';
import Loading from '../../containers/Loading';
import SafeAreaView from '../../containers/SafeAreaView';
import StatusIcon from '../../containers/Status/Status';
import { FormTextInput } from '../../containers/TextInput';
import { IApplicationState, TUserStatus } from '../../definitions';
import I18n from '../../i18n';
import { showToast } from '../../lib/methods/helpers/showToast';
import { Services } from '../../lib/services';
import { getUserSelector } from '../../selectors/login';
import { showErrorAlert } from '../../lib/methods/helpers';
import log, { events, logEvent } from '../../lib/methods/helpers/log';

interface IStatus {
	id: TUserStatus;
	name: string;
}

const STATUS: IStatus[] = [
	{
		id: 'online',
		name: 'Online'
	},
	{
		id: 'busy',
		name: 'Busy'
	},
	{
		id: 'away',
		name: 'Away'
	},
	{
		id: 'offline',
		name: 'Invisible'
	}
];

const styles = StyleSheet.create({
	inputContainer: {
		marginTop: 32,
		marginBottom: 32
	},
	inputLeft: {
		position: 'absolute',
		top: 12,
		left: 12
	},
	inputStyle: {
		paddingLeft: 48
	}
});

const Status = ({ status }: { status: IStatus }) => {
	const user = useSelector((state: IApplicationState) => getUserSelector(state));
	const dispatch = useDispatch();

	const { id, name } = status;
	return (
		<List.Item
			title={name}
			onPress={async () => {
				const key = `STATUS_${status.id.toUpperCase()}` as keyof typeof events;
				logEvent(events[key]);
				if (user.status !== status.id) {
					try {
						await Services.setUserStatus(status.id, user.statusText || '');
						dispatch(setUser({ status: status.id }));
					} catch (e: any) {
						const messageError =
							e.error && e.error.includes('[error-too-many-requests]')
								? I18n.t('error-too-many-requests', { seconds: e.reason.replace(/\D/g, '') })
								: e.reason;
						showErrorAlert(messageError);
						logEvent(events.SET_STATUS_FAIL);
						log(e);
					}
				}
			}}
			testID={`status-view-${id}`}
			left={() => <StatusIcon size={24} status={status.id} />}
		/>
	);
};

const StatusView = (): React.ReactElement => {
	const user = useSelector((state: IApplicationState) => getUserSelector(state));
	const isMasterDetail = useSelector((state: IApplicationState) => state.app.isMasterDetail);
	const Accounts_AllowInvisibleStatusOption = useSelector(
		(state: IApplicationState) => state.settings.Accounts_AllowInvisibleStatusOption
	);

	const [statusText, setStatusText] = useState(user.statusText || '');
	const [loading, setLoading] = useState(false);

	const dispatch = useDispatch();
	const { setOptions, goBack } = useNavigation();

	useEffect(() => {
		const submit = async () => {
			logEvent(events.STATUS_DONE);
			if (statusText !== user.statusText) {
				await setCustomStatus(user.status, statusText);
			}
			goBack();
		};
		const setHeader = () => {
			setOptions({
				title: I18n.t('Edit_Status'),
				headerLeft: isMasterDetail ? undefined : () => <HeaderButton.CancelModal onPress={goBack} />,
				headerRight: () => (
					<HeaderButton.Container>
						<HeaderButton.Item title={I18n.t('Done')} onPress={submit} testID='status-view-submit' />
					</HeaderButton.Container>
				)
			});
		};
		setHeader();
	}, [statusText, user.status]);

	const setCustomStatus = async (status: string, statusText: string) => {
		setLoading(true);
		try {
			await Services.setUserStatus(status, statusText);
			dispatch(setUser({ statusText }));
			logEvent(events.STATUS_CUSTOM);
			showToast(I18n.t('Status_saved_successfully'));
		} catch (e: any) {
			const messageError =
				e.error && e.error.includes('[error-too-many-requests]')
					? I18n.t('error-too-many-requests', { seconds: e.reason.replace(/\D/g, '') })
					: e.reason;
			logEvent(events.STATUS_CUSTOM_F);
			showErrorAlert(messageError);
		}
		setLoading(false);
	};

	const status = Accounts_AllowInvisibleStatusOption ? STATUS : STATUS.filter(s => s.id !== 'offline');

	return (
		<SafeAreaView testID='status-view'>
			<FlatList
				data={status}
				keyExtractor={item => item.id}
				renderItem={({ item }) => <Status status={item} />}
				ListHeaderComponent={
					<>
						<FormTextInput
							value={statusText}
							containerStyle={styles.inputContainer}
							onChangeText={text => setStatusText(text)}
							left={
								<StatusIcon
									testID={`status-view-current-${user.status}`}
									style={styles.inputLeft}
									status={user.status}
									size={24}
								/>
							}
							inputStyle={styles.inputStyle}
							placeholder={I18n.t('What_are_you_doing_right_now')}
							testID='status-view-input'
						/>
						<List.Separator />
					</>
				}
				ListFooterComponent={List.Separator}
				ItemSeparatorComponent={List.Separator}
			/>
			<Loading visible={loading} />
		</SafeAreaView>
	);
};

export default StatusView;
