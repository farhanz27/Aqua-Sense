import React, { useState } from 'react';
import {
	Text,
	View,
	StyleSheet,
	KeyboardAvoidingView,
	TextInput,
	TouchableOpacity,
	ActivityIndicator,
	Alert,
	StatusBar,
} from 'react-native';
import auth from '@react-native-firebase/auth';

export default function Index() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);

	const signUp = async () => {
		setLoading(true);
		try {
			await auth().createUserWithEmailAndPassword(email, password);
			Alert.alert('Success', 'Account created! Check your email for confirmation.');
		} catch (e: any) {
			Alert.alert('Registration Failed', e.message || 'Something went wrong.');
		} finally {
			setLoading(false);
		}
	};

	const signIn = async () => {
		setLoading(true);
		try {
			await auth().signInWithEmailAndPassword(email, password);
			Alert.alert('Welcome Back!', 'You are now logged in.');
		} catch (e: any) {
			Alert.alert('Login Failed', e.message || 'Invalid credentials.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<View style={styles.container}>
			<StatusBar barStyle="dark-content" backgroundColor="#F7F7F7" />
			<KeyboardAvoidingView behavior="padding" style={styles.keyboard}>
				<Text style={styles.title}>AquaSense</Text>

				<TextInput
					style={styles.input}
					value={email}
					onChangeText={setEmail}
					autoCapitalize="none"
					keyboardType="email-address"
					placeholder="Email"
					placeholderTextColor="#888"
				/>

				<TextInput
					style={styles.input}
					value={password}
					onChangeText={setPassword}
					secureTextEntry
					placeholder="Password"
					placeholderTextColor="#888"
				/>

				{loading ? (
					<ActivityIndicator size="large" color="#3A8DFF" style={styles.loader} />
				) : (
					<>
						<TouchableOpacity style={styles.button} onPress={signIn} disabled={loading}>
							<Text style={styles.buttonText}>Login</Text>
						</TouchableOpacity>
						<TouchableOpacity style={[styles.button, styles.signupButton]} onPress={signUp} disabled={loading}>
							<Text style={styles.signupButtonText}>Create Account</Text>
						</TouchableOpacity>
					</>
				)}
			</KeyboardAvoidingView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F7F7F7',
		justifyContent: 'center',
		padding: 20,
	},
	keyboard: {
		width: '100%',
	},
	title: {
		fontSize: 28,
		fontWeight: 'bold',
		color: '#333',
		textAlign: 'center',
		marginBottom: 20,
	},
	input: {
		height: 50,
		borderWidth: 1,
		borderColor: '#DDD',
		borderRadius: 8,
		paddingHorizontal: 15,
		backgroundColor: '#FFF',
		marginBottom: 12,
	},
	button: {
		backgroundColor: '#3A8DFF',
		paddingVertical: 12,
		borderRadius: 8,
		alignItems: 'center',
		marginVertical: 6,
		shadowColor: '#3A8DFF',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		elevation: 2,
	},
	buttonText: {
		color: '#FFF',
		fontSize: 16,
		fontWeight: 'bold',
	},
	signupButton: {
		backgroundColor: '#FFF',
		borderWidth: 1,
		borderColor: '#3A8DFF',
	},
	signupButtonText: {
		color: '#3A8DFF',
		fontSize: 16,
		fontWeight: 'bold',
	},
	loader: {
		marginTop: 20,
	},
});
