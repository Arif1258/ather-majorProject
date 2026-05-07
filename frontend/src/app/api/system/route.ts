import { NextResponse } from 'next/server';
import os from 'os';

export const runtime = 'nodejs';
export const revalidate = 0;

function getCPUInfo() {
  const cpus = os.cpus();
  let overallIdle = 0;
  let overallTotal = 0;

  const cores = cpus.map((core) => {
    let total = 0;
    for (const type in core.times) {
      total += core.times[type as keyof typeof core.times];
    }
    overallTotal += total;
    overallIdle += core.times.idle;
    
    return {
       idle: core.times.idle,
       total: total
    };
  });

  return {
    idle: overallIdle / cpus.length,
    total: overallTotal / cpus.length,
    cores
  };
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET() {
  try {
    const startMeasure = getCPUInfo();
    await delay(100);
    const endMeasure = getCPUInfo();
    
    const idleDifference = endMeasure.idle - startMeasure.idle;
    const totalDifference = endMeasure.total - startMeasure.total;
    const cpuUsage = 100 - ~~(100 * idleDifference / totalDifference);

    const perCoreUsage = endMeasure.cores.map((endCore, i) => {
       const startCore = startMeasure.cores[i];
       const iDiff = endCore.idle - startCore.idle;
       const tDiff = endCore.total - startCore.total;
       let usage = 100 - ~~(100 * iDiff / tDiff);
       if (usage < 0) usage = 0;
       if (usage > 100) usage = 100;
       return { core: `Core ${i}`, usage };
    });

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    return NextResponse.json({
      success: true,
      data: {
        cpuUsage: cpuUsage < 0 ? 0 : cpuUsage > 100 ? 100 : cpuUsage,
        perCoreUsage,
        memory: {
          total: totalMem,
          used: usedMem,
          free: freeMem
        },
        uptime: os.uptime(),
        loadAverage: os.loadavg()
      }
    });
  } catch (error) {
    console.error("System OS route failure:", error);
    return NextResponse.json({ success: false, error: "Failed to grab system analytics" }, { status: 500 });
  }
}
