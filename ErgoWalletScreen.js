import React, {useEffect, useState} from 'react';
import {Clipboard, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {FontAwesome5} from '@expo/vector-icons';
import {createClient} from "@supabase/supabase-js";
import axios from "axios"; // You'll need to install the FontAwesome5 package

function ErgoWalletScreen({ route }) {
  const { walletAddress, userId,  mnemonic } = route.params;

  const [balance, setBalance] = useState("0.00");

  const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_ADDRESS, process.env.EXPO_PUBLIC_SUPABASE_API_KEY);

  const getAddress = async () => {
    const {data, error} = await supabase.from('Blockchain')
        .select('address')
        .eq('user_id', userId)

    if(error){
      console.log("error getting address");
      return "error";
    }

    return data[0].address;
  }

  const copyToClipboardWalletAddress = async () => {

    const address = await getAddress();

    Clipboard.setString(address);
  };

const copyToClipboardMnemonic = async () => {
  const {data, error} = await supabase.from('Blockchain')
      .select('mnemonic')
      .eq('user_id', userId)

  if (error) {
    console.log("error getting address");
    return;
  }

  const mnemonic = data[0].mnemonic;

  Clipboard.setString(mnemonic);
};

  const getBalance = async () => {
    const address = await getAddress();
    if (address === "error") {
      return "0.00";
    }
    const api = `${process.env.EXPO_PUBLIC_TESTNET_EXPLORER_BASE_API_URL}/api/v1/addresses/${address}/balance/total`
    try {
      const res = await axios.get(api);
      const nanoErgs = res.data.confirmed.nanoErgs;
      const ergs = nanoErgs * 10 ** -9;
      return ergs.toFixed(2);
    } catch (e) {
      console.log("error fetching balance");
      return "0.00";
    }
  }

  useEffect(() => {
    const fetchBalance = async () => {
      const balance = await getBalance();
      console.log(balance);
      setBalance(balance);
    };

    fetchBalance();
  }, [])

// Get text from clipboard

  return (
    <View style={styles.container}>
      <Text style={styles.balanceTitle}>Current ERG coin Balance</Text>
      <View style={styles.bigBalanceContainer}>
        <Text style={styles.bigBalanceAmount}>{balance} ERG</Text>
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
