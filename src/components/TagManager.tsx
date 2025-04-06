'use client';

import React, { useEffect, useState } from 'react';
import { MatterportSDK, TagData } from '../types/matterport';

interface TagManagerProps {
  showcase: MatterportSDK | null;
}

const OFFICE_TAG_DATA: TagData = {
  label: 'Office',
  description: 'Company Office',
  anchorPosition: { x: 62, y: 0.5, z: -3 },
  stemVector: { x: 0, y: 1, z: 0 },
  color: { r: 0, g: 0.5, b: 1 }
};

export default function TagManager({ showcase }: TagManagerProps) {
  const [officeTagId, setOfficeTagId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    if (!showcase) return;

    const createOfficeTag = async () => {
      try {
        setIsLoading(true);
        const tagIds = await showcase.Tag.add(OFFICE_TAG_DATA);
        if (tagIds && tagIds.length > 0) {
          setOfficeTagId(tagIds[0]);
        }
      } catch (error) {
        console.error('Error creating Office tag:', error);
      } finally {
        setIsLoading(false);
      }
    };

    createOfficeTag();

    return () => {
      if (officeTagId) {
        showcase.Tag.delete(officeTagId).catch(console.error);
      }
    };
  }, [showcase]);

  const moveToOffice = async () => {
    if (!showcase || !officeTagId || isMoving) return;

    try {
      setIsMoving(true);
      
      // Створюємо граф на основі точок у просторі
      const sweepGraph = await showcase.Sweep.createGraph();
      
      // Отримуємо поточний sweep через Scene.getData()
      const sceneData = await showcase.Scene.getData();
      const currentSweepId = sceneData.sweep;
      
      // Отримуємо всі sweep точки
      const sweeps = showcase.Sweep.data;
      
      // Знаходимо найближчий sweep до позиції тегу Office
      let nearestSweep = null;
      let minDistance = Infinity;
      
      for (const [sweepId, sweepData] of Object.entries(sweeps)) {
        const dx = sweepData.position.x - OFFICE_TAG_DATA.anchorPosition.x;
        const dy = sweepData.position.y - OFFICE_TAG_DATA.anchorPosition.y;
        const dz = sweepData.position.z - OFFICE_TAG_DATA.anchorPosition.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        if (distance < minDistance) {
          minDistance = distance;
          nearestSweep = sweepId;
        }
      }
      
      if (!nearestSweep || !currentSweepId) {
        throw new Error('Could not find start or end point');
      }
      
      // Отримуємо вершини графу
      const startVertex = sweepGraph.vertex(currentSweepId);
      const endVertex = sweepGraph.vertex(nearestSweep);
      
      if (!startVertex || !endVertex) {
        throw new Error('Could not find vertices in graph');
      }
      
      // Створюємо A* runner для пошуку шляху
      const pathfinder = showcase.Graph.createAStarRunner(sweepGraph, startVertex, endVertex);
      
      // Отримуємо результат пошуку шляху
      const result = pathfinder.exec();
      
      if (result.status === showcase.Graph.AStarStatus.SUCCESS) {
        // Проходимо по кожній точці шляху
        for (const point of result.path) {
          if (!isMoving) break;
          
          // Переміщуємося до кожної точки
          await showcase.Sweep.moveTo(point.id, {
            transition: {
              duration: 1000,
              easing: 'linear'
            }
          });
        }
        
        // Фінальне переміщення до точної позиції тегу
        await showcase.Camera.moveTo({
          position: OFFICE_TAG_DATA.anchorPosition,
          transition: {
            duration: 1000,
            easing: 'linear'
          }
        });
      } else {
        throw new Error('Could not find path');
      }
      
      // Очищуємо ресурси
      sweepGraph.dispose();
      
    } catch (error) {
      console.error('Error moving to Office:', error);
    } finally {
      setIsMoving(false);
    }
  };

  const teleportToOffice = async () => {
    if (!showcase || !officeTagId) return;

    try {
      setIsLoading(true);
      await showcase.Tag.open(officeTagId);
    } catch (error) {
      console.error('Error teleporting:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '1rem',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '1rem',
      zIndex: 9999
    }}>
      <button
        onClick={moveToOffice}
        disabled={isLoading || !officeTagId || isMoving}
        style={{
          backgroundColor: isMoving ? '#93C5FD' : '#3B82F6',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '0.375rem',
          border: 'none',
          cursor: 'pointer',
          opacity: (isLoading || !officeTagId || isMoving) ? 0.5 : 1,
          transition: 'all 0.2s ease'
        }}
      >
        {isMoving ? 'Moving...' : 'Move to Office'}
      </button>
      
      <button
        onClick={teleportToOffice}
        disabled={isLoading || !officeTagId}
        style={{
          backgroundColor: isLoading ? '#93C5FD' : '#3B82F6',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '0.375rem',
          border: 'none',
          cursor: 'pointer',
          opacity: (isLoading || !officeTagId) ? 0.5 : 1,
          transition: 'all 0.2s ease'
        }}
      >
        {isLoading ? 'Teleporting...' : 'Teleport to Office'}
      </button>
    </div>
  );
} 