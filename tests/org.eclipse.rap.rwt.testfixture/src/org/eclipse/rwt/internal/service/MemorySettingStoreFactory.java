/*******************************************************************************
 * Copyright (c) 2002, 2008 Innoopract Informationssysteme GmbH.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     Innoopract Informationssysteme GmbH - initial API and implementation
 ******************************************************************************/

package org.eclipse.rwt.internal.service;

import org.eclipse.rwt.internal.util.ParamCheck;
import org.eclipse.rwt.service.*;

/**
 * {@link ISettingStoreFactory} that creates {@link MemorySettingStore} 
 * instances.
 */
public final class MemorySettingStoreFactory implements ISettingStoreFactory {

  public ISettingStore createSettingStore( final String storeId ) {
    ParamCheck.notNullOrEmpty( storeId, "storeId" );
    return new MemorySettingStore( storeId );
  }
}
