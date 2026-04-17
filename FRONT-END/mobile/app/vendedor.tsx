/*import {View, Text} from 'react-native';

export default function Vendedor(){
    return (
        <View style={{ padding: 20}}>
            <Text style={{ fontSize: 20,
                fontWeight: 'bold'}}> Lanche do João</Text>

            <Text style={{ marginTop: 10}}>
                Aqui vai o cardápio 
            </Text>
        </View>
    );
} */

import { View, Text } from 'react-native';
import { useLocalSearchParams} from 'expo-router';

export default function Vendedor(){
    const { nome, tipo } = useLocalSearchParams();

    return (
        <View style={{ flex: 1, padding: 20}}>
            <Text style={{ fontSize: 22, fontWeight: 'bold'}}>{nome}</Text>

            <Text style={{ marginTop: 10}}>
                Tipo: {tipo}
            </Text>

            <Text style={{ marginTop: 20}}>Aqui vai o cardápio depois</Text>
        </View>
    );
}