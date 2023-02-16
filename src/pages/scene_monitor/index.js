import { dynamic } from 'umi';

export default dynamic({
    loader:async function(){
        const { default:SceneMonitor } = await import('./SceneMonitor');
        return SceneMonitor;
    }
})
