import { dynamic } from 'umi';

export default dynamic({
    loader:async function(){
        const { default:DataReport } = await import('./DataReport');
        return DataReport;
    }
})
