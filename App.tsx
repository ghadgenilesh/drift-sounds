import React, { useState } from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { moods, Mood } from './src/moods';
import { useNightPlayer } from './src/audio/useNightPlayer';
import { MoodAtmosphere } from './src/effects/MoodAtmosphere';
import { PlaybackBars } from './src/effects/PlaybackBars';
import { WebSetup } from './src/web/WebSetup';
import { orderSounds, readHistory } from './src/soundHistory';
import { Control, typeSize as t } from './src/ui/Control';
import { Icon } from './src/ui/Icon';

export default function App() {
  const [selected, setSelected] = useState<Mood | null>(null);
  const [orderedMoods] = useState(() => orderSounds(moods, readHistory()));
  const [timerOpen, setTimerOpen] = useState(false);
  const [dockHeight, setDockHeight] = useState(0);
  const { width, fontScale } = useWindowDimensions();
  const night = useNightPlayer(moods[0]);
  const engaged = night.active || night.busy;
  const timer = night.remaining !== null ? `${Math.floor(night.remaining / 60)}:${String(night.remaining % 60).padStart(2, '0')} left` : night.minutes ? `${night.minutes} min` : 'No Timer';
  const singleColumn = width < 360 || fontScale > 1.35;
  return <SafeAreaProvider><StatusBar style="light"/><LinearGradient colors={['#171C2E', '#0B111C', '#10151F']} style={s.root}>
    <SafeAreaView style={s.root}>
      <ScrollView contentContainerStyle={[s.content, {paddingBottom: dockHeight + 32}]} showsVerticalScrollIndicator={false}>
        <View style={s.top}><View style={s.brandRow}><Icon name="moon" size={20}/><Text style={s.brand}>DRIFT</Text></View><Text style={s.offlineText}>{Platform.OS === 'web' ? 'Your quiet, anywhere' : 'Always offline'}</Text></View>
        <Text style={s.kicker}>A SOFTER END TO YOUR DAY</Text>
        <Text accessibilityRole="header" style={s.title}>Find your quiet.</Text>
        <Text style={s.subtitle}>Tap a sound. Settle into your night.</Text>
        <View style={s.grid}>{orderedMoods.map(mood => {
          const chosen = selected?.id === mood.id;
          const playing = chosen && night.playing;
          const preparing = chosen && night.busy;
          return <Control key={mood.id} accessibilityRole="button" accessibilityLabel={`${playing ? 'Playing' : preparing ? 'Preparing' : 'Play'} ${mood.name}. ${mood.detail}`} accessibilityState={{selected: playing, busy: preparing}} onPress={() => {setSelected(mood); night.select(mood);}} style={[s.card, singleColumn && {width:'100%'}, {borderColor: playing ? mood.color : '#ffffff24'}]}>
            <LinearGradient colors={mood.colors} style={s.cardInside}>
              <View style={s.cardTop}><Icon name={mood.id} color={mood.color} size={30}/>{playing && <Icon name="check" color={mood.color} size={20}/>}</View>
              <Text style={s.cardName}>{mood.name}</Text><Text style={s.cardDetail}>{mood.detail}</Text>
              <Text style={[s.cardState, {color:mood.color}]}>{chosen ? (preparing ? 'Preparing…' : playing ? 'Playing' : night.active ? 'Paused' : 'Stopped') : ' '}</Text>
            </LinearGradient>
          </Control>;
        })}</View>
        <WebSetup/>
        <Text style={s.bottom}>Just sound. Just rest. Always free.</Text>
      </ScrollView>
      <MoodAtmosphere mood={night.playing ? selected?.id : undefined}/>
      {selected && <View testID="player-dock" style={s.dock} onLayout={event => setDockHeight(event.nativeEvent.layout.height)}>
        <ScrollView style={s.dockScroll} contentContainerStyle={s.dockContent}>
          <View style={s.playerRow}>
            {Platform.OS === 'web' && <Image testID="now-playing-artwork" accessible={false} source={{uri:`/artwork/v1/${selected.id}-192.png`}} style={{width:48,height:48,borderRadius:10}}/>}
            <View style={s.playerTitle}><Text accessibilityLiveRegion="polite" style={s.eyebrow}>{night.busy ? 'Preparing your sound' : night.playing ? 'Now playing' : night.active ? 'Paused' : 'Stopped'}</Text><Text style={s.sessionTitle}>{selected.name}</Text></View>
            <PlaybackBars playing={night.playing} color={selected.color}/>
            {engaged && <Control accessibilityRole="button" accessibilityLabel="Stop sound" onPress={night.end} style={s.stop}><Icon name="stop" size={18}/><Text style={s.controlText}>Stop</Text></Control>}
          </View>
          <Control accessibilityRole="button" accessibilityLabel={`Sleep timer. ${timer}. ${timerOpen ? 'Hide options' : 'Show options'}`} accessibilityState={{expanded:timerOpen}} onPress={() => setTimerOpen(!timerOpen)} style={s.timerToggle}><Icon name="clock" size={20}/><Text style={s.timerLabel}>Sleep timer</Text><Text style={s.timerValue}>{timer}</Text><Text style={s.controlText}>{timerOpen ? 'Done' : 'Change'}</Text></Control>
          {timerOpen && <View testID="timer-options" style={s.timers}>{[0,30,60,90].map(value => <Control key={value} accessibilityRole="button" accessibilityLabel={value ? `${value} minute sleep timer` : 'No Timer. Play until I stop it.'} accessibilityState={{selected:night.minutes===value}} onPress={() => night.setTimer(value)} style={[s.timer, night.minutes===value && s.timerSelected]}><Text style={s.controlText}>{value ? `${value} min` : 'No Timer'}</Text>{night.minutes===value && <Icon name="check" size={16}/>}</Control>)}</View>}
          {night.error && <Text accessibilityRole="alert" style={s.error}>{night.error}</Text>}
        </ScrollView>
      </View>}
    </SafeAreaView>
  </LinearGradient></SafeAreaProvider>;
}
const s=StyleSheet.create({
  root:{flex:1},content:{paddingHorizontal:20,paddingTop:24,width:'100%',maxWidth:620,alignSelf:'center'},
  top:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:16,flexWrap:'wrap',marginBottom:32},brandRow:{flexDirection:'row',alignItems:'center',gap:8},brand:{color:'#EEE9E1',fontSize:t(14),fontWeight:'600',letterSpacing:2},offlineText:{color:'#B3BECE',fontSize:t(14),lineHeight:t(21)},
  kicker:{color:'#C2B9AF',fontSize:t(12),letterSpacing:1.2,lineHeight:t(19),marginBottom:12},title:{color:'#F1ECE4',fontSize:t(36),lineHeight:t(42),letterSpacing:-.7,fontWeight:'600'},subtitle:{color:'#B3BECE',fontSize:t(16),lineHeight:t(24),marginTop:12,marginBottom:28},
  grid:{flexDirection:'row',flexWrap:'wrap',gap:12},card:{width:'47%',flexGrow:1,borderRadius:20,borderWidth:1.5,overflow:'hidden'},cardInside:{padding:18,minHeight:160,flex:1},cardTop:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:18},cardName:{color:'#F0EBE5',fontSize:t(17),lineHeight:t(24),fontWeight:'600',marginBottom:6},cardDetail:{color:'#C1C7D1',fontSize:t(14),lineHeight:t(21)},cardState:{fontSize:t(14),lineHeight:t(21),fontWeight:'600',marginTop:12},bottom:{color:'#A9B4C5',fontSize:t(14),lineHeight:t(21),textAlign:'center',marginTop:28},
  dock:{position:'absolute',bottom:0,left:0,right:0,maxHeight:'55%',backgroundColor:'#171F2D',borderTopWidth:1,borderColor:'#7F8BA0',zIndex:5},dockScroll:{flexShrink:1},dockContent:{width:'100%',maxWidth:620,alignSelf:'center',padding:16,gap:12},playerRow:{flexDirection:'row',alignItems:'center',gap:12,flexWrap:'wrap'},playerTitle:{flex:1,minWidth:100},eyebrow:{color:'#B5C1D2',fontSize:t(14),lineHeight:t(21)},sessionTitle:{color:'#F0EBE5',fontSize:t(19),lineHeight:t(27),fontWeight:'600'},stop:{minHeight:48,paddingHorizontal:16,borderRadius:14,backgroundColor:'#344156',flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8},controlText:{color:'#F0EBE5',fontSize:t(14),lineHeight:t(21),fontWeight:'600'},timerToggle:{flexDirection:'row',alignItems:'center',gap:10,flexWrap:'wrap',minHeight:48,padding:10,borderRadius:12,backgroundColor:'#253146'},timerLabel:{color:'#D0D8E4',fontSize:t(14),lineHeight:t(21)},timerValue:{color:'#F0EBE5',fontSize:t(14),lineHeight:t(21),flex:1},timers:{flexDirection:'row',flexWrap:'wrap',gap:8},timer:{flexGrow:1,flexBasis:'45%',minHeight:48,padding:12,borderRadius:12,borderWidth:1,borderColor:'#7B8BA2',backgroundColor:'#202B3D',flexDirection:'row',gap:8,alignItems:'center',justifyContent:'center'},timerSelected:{backgroundColor:'#43546F',borderColor:'#DAE2EE'},error:{color:'#FFD1CB',fontSize:t(14),lineHeight:t(21)},
});
