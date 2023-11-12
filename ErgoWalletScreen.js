import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Clipboard } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons'; // You'll need to install the FontAwesome5 package

function ErgoWalletScreen({ route }) {
  const { walletAddress, mnemonic } = route.params;

  const copyToClipboardWalletAddress = () => {
    Clipboard.setString("address");
        };

const copyToClipboardMnemonic = () => {
    Clipboard.setString("mnemonic");
    };

// Get text from clipboard
const getTextFromClipboard = async () => {
  const text = await Clipboard.getString();
  // Use the text from the clipboard as needed
};

  const balanceAmount = 123.45; // Replace with the actual balance amount

  return (
    <View style={styles.container}>
      <Text style={styles.balanceTitle}>Current ERG coin Balance</Text>
      <View style={styles.bigBalanceContainer}>
        <Text style={styles.bigBalanceAmount}>{balanceAmount} ERG</Text>
      </View>

      <View style={styles.buttonContainer}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.copyButton}
            onPress={() => copyToClipboardWalletAddress()}
          >
            <FontAwesome5 name="copy" size={20} color="white" />
            <Text style={styles.buttonText}>Wallet Address</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.copyButton}
            onPress={() => copyToClipboardMnemonic()}
          >
            <FontAwesome5 name="copy" size={20} color="white" />
            <Text style={styles.buttonText}>Mnemonic</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  balanceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  bigBalanceContainer: {
    flex: 3, // Decreased the flex value
    justifyContent: 'center',
    alignItems: 'center',
  },
  bigBalanceAmount: {
    fontSize: 36,
  },
  buttonContainer: {
    flex: 2, // Increased the flex value
    width: '100%',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498db',
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 10,
  },
});

export default ErgoWalletScreen;
