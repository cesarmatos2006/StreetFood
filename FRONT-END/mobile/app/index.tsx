/*import { View, Text, TouchableOpacity} from 'react-native';
import { useRouter } from 'expo-router';

export default function Home(){
    const router = useRouter();

    return (
        <View style={{padding: 20}}>
            <Text style={{ fontSize:20, fontWeight: 'bold' }}> Vendedores Próximos</Text>

            <TouchableOpacity 
            onPress={() => router.push('/vendedor')}
            style={{
                backgroundColor: '#ddd',
                padding: 15,
                marginTop: 15,
                borderRadius: 10
            }}
            >
                <Text>Lanche do João</Text>
            </TouchableOpacity>
        </View>
    );
}
 botão simples que leva de uma tela para outra    */ 

 import {View, Text, TouchableOpacity, FlatList} from 'react-native';
 import { useRouter} from 'expo-router';

export default function Home(){
    const router = useRouter();

    const vendedores = [ 
        { id: '1', nome: 'Lanche do João', tipo: 'hambúrguer'},
        { id: '2', nome: 'Pastel da Maria', tipo: 'pastel'},
        { id: '3', nome: 'Doce da Ana', tipo: 'Doce'},
    ];

    return (
        <View style={{ flex: 1, padding: 20}}>

            {/* Titulo */}
            <Text style={{ fontSize: 22, fontWeight: 'bold'}}>Vendedores Próximos </Text>

            {/* Lista */}
            <FlatList
                data={vendedores}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({item}) => (
                    <TouchableOpacity
                        onPress={() =>
                            router.push({
                                pathname: '/vendedor',
                                params: {
                                    nome: item.nome,
                                    tipo: item.tipo,
                                },
                            })
                        }
                        style={{
                            backgroundColor: '#eee',
                            padding: 15,
                            marginTop: 15,
                            borderRadius: 10,
                        }}
                    >
                        <Text style={{ fontSize: 16, fontWeight: 'bold'}}>{item.nome}
                        </Text>
                        <Text>{item.tipo}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}