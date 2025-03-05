import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList } from 'react-native';
import * as SQLite from 'expo-sqlite';

export default function App() {
  const [product, setProduct] = useState('');
  const [amount, setAmount] = useState('');
  const [shoppinglist, setShoppinglist] = useState([]);
  const db = SQLite.openDatabaseSync('shoppingdb');

  const initialize = async () => {
    try {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS productlist (id INTEGER PRIMARY KEY NOT NULL, product TEXT, amount TEXT);
      `);

    } catch (error) {
      console.error('Could not open database', error);
    }
  }
  useEffect(() => { initialize() }, []);

  const handleSave = async () => {
    console.log('saved', amount, product)
    try {
      await db.runAsync('INSERT INTO productlist (product, amount) VALUES (?, ?)', product, amount);
      await updateList()
    } catch (error) {
      console.error('Could not add item', error);
    }
    setAmount('')
    setProduct('')
  };

  const updateList = async () => {
    try {
      const list = await db.getAllAsync('SELECT * from productlist');
      setShoppinglist(list);
    } catch (error) {
      console.error('Could not get items', error);
    }
  }

  const deleteItem = async (id) => {
    try {
      await db.runAsync('DELETE FROM productlist WHERE id=?', id);
      await updateList();
    }
    catch (error) {
      console.error('Could not delete item', error);
    }
  }

  

  return (
    <View style={styles.container}>

      <TextInput style={styles.input}
        placeholder='Product'
        value={product}
        onChangeText={product => setProduct(product)} />

      <TextInput style={styles.input}
        placeholder='Amount'
        value={amount}
        onChangeText={amount => setAmount(amount)} />

      <StatusBar style="auto" />

      <Button onPress={handleSave} title='Save' />

      <FlatList
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) =>
          <View style={styles.list}>
            <Text>{`${item.product} ${item.amount}`}</Text>
            
            <Text style={styles.delete} onPress={() => deleteItem(item.id)}>Bought</Text>
          </View>
        }
        data={shoppinglist}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: '80%',
    paddingHorizontal: 10,
    marginBottom: 10
  },
  list: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    
    
  },
  delete: {
    color: '#ff0000',
    marginLeft: 10
  },
});
