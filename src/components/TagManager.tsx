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


  
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const moveToOffice = async () => {
    if (!showcase || !officeTagId || isMoving) return;
  
    try {
      setIsMoving(true);

      // Чекаємо, поки SDK повністю завантажиться
      await delay(1000);

      // Перевіряємо, які компоненти SDK доступні
      const availableComponents = {
        Sweep: !!showcase.Sweep,
        Scene: !!showcase.Scene,
        Graph: !!showcase.Graph,
        Camera: !!showcase.Camera
      };

      console.log('Доступні компоненти SDK:', availableComponents);

      // Якщо доступні необхідні компоненти для навігації
      if (availableComponents.Sweep && availableComponents.Graph) {
        // Перевіряємо доступні методи Sweep
        console.log('Доступні методи Sweep:', Object.keys(showcase.Sweep));
        
        // Отримуємо дані про всі точки огляду
        const sweepsData = showcase.Sweep.data;
        console.log('Дані про точки огляду:', sweepsData);

        if (!sweepsData || Object.keys(sweepsData).length === 0) {
          throw new Error('Не знайдено доступних точок огляду');
        }

        // Знаходимо найближчу точку огляду до офісу
        let nearestSweep: string | null = null;
        let minDistance = Infinity;
    
        for (const [sweepId, sweepInfo] of Object.entries(sweepsData)) {
          const distance = Math.sqrt(
            Math.pow(sweepInfo.position.x - OFFICE_TAG_DATA.anchorPosition.x, 2) +
            Math.pow(sweepInfo.position.y - OFFICE_TAG_DATA.anchorPosition.y, 2) +
            Math.pow(sweepInfo.position.z - OFFICE_TAG_DATA.anchorPosition.z, 2)
          );
          
          if (distance < minDistance) {
            minDistance = distance;
            nearestSweep = sweepId;
          }
        }

        if (!nearestSweep) {
          throw new Error('Не вдалося знайти найближчу точку огляду до офісу');
        }

        console.log('Найближча точка огляду до офісу:', nearestSweep);

        // Переміщуємося до найближчої точки огляду
        await showcase.Sweep.moveTo(nearestSweep, {
          transition: {
            duration: 3000,
            easing: 'easeInOut'
          }
        });

        // Переміщуємо камеру до позиції офісу
        if (availableComponents.Camera) {
          await showcase.Camera.moveTo({
            position: OFFICE_TAG_DATA.anchorPosition
          });
        }
      } else {
        throw new Error('Недостатньо доступних компонентів SDK для навігації');
      }
  
    } catch (error) {
      console.error('Помилка під час переміщення до Office:', error);
    } finally {
      setIsMoving(false);
    }
  };
  
  
  
  

  const teleportToOffice = async () => {
    if (!showcase || !officeTagId) return;

    try {
      setIsLoading(true);
      
      // Open tag with custom options
      await showcase.Tag.open(officeTagId, {
        transition: {
          duration: 0, // Миттєве переміщення
          easing: 'linear'
        },
        allowAction: true, // Дозволити дії з тегом
        openTags: {
          open: true, // Відкрити тег
          close: false // Не закривати інші теги
        }
      });
      
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