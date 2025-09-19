import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  Pressable,
  StyleSheet,
  Keyboard,
  Alert,
} from 'react-native';

export default function App() {
  const [alumnos, setAlumnos] = useState([]);
  const [nombre, setNombre] = useState('');
  const [edad, setEdad] = useState('');
  const [editId, setEditId] = useState(null);

  const nombreRef = useRef(null);
  const edadRef = useRef(null);

  const validar = useCallback(() => {
    const n = nombre.trim();
    const e = Number(edad);
    if (!n) {
      Alert.alert('Validación', 'El nombre no puede estar vacío.');
      return null;
    }
    if (!edad || Number.isNaN(e) || e <= 0 || !Number.isInteger(e)) {
      Alert.alert('Validación', 'La edad debe ser un entero positivo.');
      return null;
    }
    return { nombre: n, edad: e };
  }, [nombre, edad]);

  const onAgregar = useCallback(() => {
    const data = validar();
    if (!data) return;

    const nuevo = {
      id: Date.now().toString(), 
      nombre: data.nombre,
      edad: data.edad,
    };
    setAlumnos((prev) => [nuevo, ...prev]);
    setNombre('');
    setEdad('');
    nombreRef.current?.focus();
    Keyboard.dismiss();
  }, [validar]);

  const onGuardar = useCallback(() => {
    const data = validar();
    if (!data) return;

    setAlumnos((prev) =>
      prev.map((al) =>
        al.id === editId ? { ...al, nombre: data.nombre, edad: data.edad } : al
      )
    );
    setEditId(null);
    setNombre('');
    setEdad('');
    Keyboard.dismiss();
  }, [validar, editId]);

  const onEliminar = useCallback((id) => {
    setAlumnos((prev) => prev.filter((al) => al.id !== id));
    if (editId === id) {
      setEditId(null);
      setNombre('');
      setEdad('');
    }
  }, [editId]);

  const onEliminarTodos = useCallback(() => {
    if (alumnos.length === 0) return;
    Alert.alert(
      'Confirmar',
      '¿Eliminar todos los alumnos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setAlumnos([]);
            setEditId(null);
            setNombre('');
            setEdad('');
          },
        },
      ],
      { cancelable: true }
    );
  }, [alumnos.length]);

  const onEditar = useCallback((item) => {
    setEditId(item.id);
    setNombre(item.nombre);
    setEdad(String(item.edad));
    nombreRef.current?.focus();
  }, []);

  const onCancelarEdicion = useCallback(() => {
    setEditId(null);
    setNombre('');
    setEdad('');
    Keyboard.dismiss();
  }, []);

  const renderItem = useCallback(({ item }) => {
    return (
      <View style={styles.item}>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemNombre}>{item.nombre}</Text>
          <Text style={styles.itemEdad}>Edad: {item.edad}</Text>
        </View>

        <View style={styles.itemBtns}>
          <Pressable
            onPress={() => onEditar(item)}
            style={({ pressed }) => [styles.btnSmall, pressed && styles.pressed]}
          >
            <Text style={styles.btnSmallText}>Editar</Text>
          </Pressable>

          <Pressable
            onPress={() => onEliminar(item.id)}
            style={({ pressed }) => [styles.btnSmallDanger, pressed && styles.pressed]}
          >
            <Text style={styles.btnSmallText}>Eliminar</Text>
          </Pressable>
        </View>
      </View>
    );
  }, [onEditar, onEliminar]);

  const keyExtractor = useCallback((item) => item.id, []);
  const listaVacia = useMemo(() => (
    <Text style={styles.empty}>No hay alumnos cargados.</Text>
  ), []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Gestión de Alumnos (FlatList)</Text>

      <View style={styles.form}>
        <TextInput
          ref={nombreRef}
          value={nombre}
          onChangeText={setNombre}
          placeholder="Nombre"
          style={styles.input}
          returnKeyType="next"
          onSubmitEditing={() => edadRef.current?.focus()}
        />
        <TextInput
          ref={edadRef}
          value={edad}
          onChangeText={setEdad}
          placeholder="Edad"
          keyboardType="number-pad"
          style={styles.input}
          returnKeyType="done"
          onSubmitEditing={() => (editId ? onGuardar() : onAgregar())}
        />

        <View style={styles.row}>
          {editId ? (
            <>
              <View style={styles.flex1}>
                <Button title="Guardar" onPress={onGuardar} />
              </View>
              <View style={styles.gap} />
              <View style={styles.flex1}>
                <Button color="#999" title="Cancelar" onPress={onCancelarEdicion} />
              </View>
            </>
          ) : (
            <View style={styles.flex1}>
              <Button title="Agregar" onPress={onAgregar} />
            </View>
          )}
        </View>

        <View style={{ height: 8 }} />

        <Button
          title="Eliminar todos"
          color="#c0392b"
          onPress={onEliminarTodos}
        />
      </View>

      <FlatList
        data={alumnos}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListEmptyComponent={listaVacia}
        contentContainerStyle={alumnos.length === 0 && styles.emptyContainer}
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f7f7f7' },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 12, textAlign: 'center', marginTop: 40 },
  form: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 2, 
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, 
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 8,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  flex1: { flex: 1 },
  gap: { width: 8 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 },
  },
  itemNombre: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  itemEdad: { color: '#555' },
  itemBtns: { flexDirection: 'row', gap: 8 },
  btnSmall: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#2d98da',
    marginLeft: 8,
  },
  btnSmallDanger: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#eb3b5a',
    marginLeft: 8,
  },
  btnSmallText: { color: 'white', fontWeight: '600' },
  pressed: { opacity: 0.7 },
  emptyContainer: { flexGrow: 1, justifyContent: 'center' },
  empty: { textAlign: 'center', color: '#777' },
});
