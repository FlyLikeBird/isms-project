import { dynamic } from 'umi';

export default dynamic({
    loader:async function(){
        const { default:PageIndex } = await import('./PageIndex');
        return PageIndex;
    }
})
